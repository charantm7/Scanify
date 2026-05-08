DO $$
BEGIN
    IF NOT EXISTS(
        SELECT 1
        FROM pg_type
        WHERE typname='order_status'
    ) THEN
        CREATE TYPE order_status AS ENUM (
            'pending',
            'accepted',
            'preparing',
            'ready',
            'served',
            'cancelled'
        );
    END IF;
END;
$$;

DO $$
BEGIN
    IF NOT EXISTS(
        SELECT 1
        FROM pg_type
        WHERE typname='payment_status'
    ) THEN
        CREATE TYPE payment_status AS ENUM (
            'pending',
            'paid',
            'failed',
            'refunded'
        );
    END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.hotel_tables (
    "id" "uuid" PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"(),
    "hotel_id" "uuid" NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    "table_number" integer NOT NULL,
    "label" varchar(50),
    "is_active" boolean NOT NULL DEFAULT true,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),

    UNIQUE("hotel_id", "table_number")
);


CREATE TABLE IF NOT EXISTS public.orders (
    "id" "uuid" PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"(),

    "hotel_id" "uuid" NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,

    "table_id" "uuid" NOT NULL REFERENCES public.hotel_tables(id) ON DELETE RESTRICT,

    "customer_name" varchar(120),

    "customer_phone" varchar(20),

    "status" public.order_status NOT NULL DEFAULT 'pending',

    "total_amount" numeric(10,2) NOT NULL CHECK (total_amount >= 0),

    "notes" varchar(1000),

    "source" varchar(20) CHECK (source IN ('qr', 'waiter', 'admin')) DEFAULT 'qr',

    "created_at" timestamptz NOT NULL DEFAULT now(),

    "updated_at" timestamptz NOT NULL DEFAULT now() 
);


CREATE TABLE IF NOT EXISTS public.order_items(
    "id" "uuid" PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"(),

    "order_id" "uuid" NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,

    "menu_item_id" "uuid" REFERENCES public.menu_items(id) ON DELETE SET NULL,

    "quantity" integer NOT NULL CHECK (quantity > 0),

    "item_name" varchar(120) NOT NULL,

    "item_price" numeric(10,2) NOT NULL CHECK (item_price >= 0),

    "created_at" timestamptz NOT NULL DEFAULT now(),

    "updated_at" timestamptz NOT NULL DEFAULT now()
);


CREATE TABLE IF NOT EXISTS public.order_payments (
  "id" "uuid" PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"(),

  "order_id" "uuid" NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,

  "hotel_id" "uuid" NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,

  "provider" varchar(50),

  "razorpay_order_id" text,

  "razorpay_payment_id" text,

  "amount" numeric(10,2) NOT NULL CHECK (amount >= 0),

  "status" public.payment_status NOT NULL DEFAULT 'pending',

  "created_at" timestamptz NOT NULL DEFAULT now(),

  "updated_at" timestamptz NOT NULL DEFAULT now(),

  UNIQUE("razorpay_payment_id")
);


-- INDEX

CREATE INDEX idx_orders_hotel_status ON public.orders(hotel_id, status);

CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);

CREATE INDEX idx_orders_table_id ON public.orders(table_id);

create INDEX idx_hotel_tables_hotel ON public.hotel_tables(hotel_id);

CREATE INDEX idx_order_items_order ON public.order_items(order_id);

CREATE INDEX idx_payments_order ON public.order_payments(order_id);

CREATE INDEX idx_payments_status ON public.order_payments(status);


-- RLS POLICY

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders: owner full access" ON public.orders
FOR ALL 
USING (
    EXISTS(
        SELECT 1
        FROM public.hotels h
        WHERE h.id = orders.hotel_id
        AND h.owner_id = auth.uid()
    )
)

WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.hotels h
        WHERE h.id = orders.hotel_id
        AND h.owner_id = auth.uid()
    )
);


CREATE POLICY "orders: public create"
ON public.orders FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.hotels h
        WHERE h.id = hotel_id
        AND h.is_active = true

    )
);

CREATE POLICY "order_items: owner full access"
ON public.order_items
FOR ALL
USING(
    EXISTS(
        SELECT 1
        FROM orders o JOIN hotels h ON h.id = o.hotel_id WHERE o.id = order_id AND h.owner_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS(
        SELECT 1
        FROM orders o JOIN hotels h ON h.id = o.hotel_id WHERE o.id = order_id AND h.owner_id = auth.uid()
    )
);

CREATE POLICY "order_items: public insert" 
ON public.order_items
FOR INSERT
WITH CHECK(
    EXISTS(
        SELECT 1
        FROM orders o 
        JOIN hotels h 
            ON h.id = o.hotel_id
        WHERE
            o.id = order_id AND
            h.is_active = true
    )
);

CREATE POLICY "hotel_tables: owner full access" 
ON public.hotel_tables 
FOR ALL
USING (
    EXISTS(
        SELECT 1
        FROM hotels h
        WHERE h.id = hotel_id
        AND h.owner_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS(
        SELECT 1
        FROM hotels h
        WHERE h.id = hotel_id
        AND h.owner_id = auth.uid()
    )
);

CREATE POLICY "hotel_tables: public read active"
ON public.hotel_tables
FOR SELECT
USING(
    is_active=true AND
    EXISTS(
        SELECT 1
        FROM hotels h
        WHERE h.id = hotel_id
        AND h.is_active=true
    )
);


CREATE POLICY "order_payments: owner read"
ON public.order_payments
FOR SELECT
USING(
    EXISTS(
        SELECT 1
        FROM hotels h
        WHERE h.id = hotel_id
        AND h.owner_id = auth.uid()
    )
);

-- FUNCTIONS

CREATE OR REPLACE FUNCTION recalc_order_total()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    UPDATE public.orders
    SET total_amount = (
        SELECT COALESCE(SUM(item_price * quantity), 0)
        FROM public.order_items WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
    )
    WHERE id = COALESCE(NEW.order_id, OLD.order_id);
    RETURN NEW;
END;
$$;


CREATE OR REPLACE FUNCTION guard_order_status()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    valid_next text[] := CASE OLD.status
        WHEN 'pending' THEN ARRAY['accepted', 'cancelled']
        WHEN 'accepted' THEN ARRAY['preparing', 'cancelled']
        WHEN 'preparing' THEN ARRAY['ready', 'cancelled']
        WHEN 'ready' THEN ARRAY['served']
        WHEN 'served' THEN ARRAY[]::text[]
        WHEN 'cancelled' THEN ARRAY[]::text[]
        ELSE  ARRAY[]::text[]
    END;
BEGIN
    IF NEW.status = OLD.status THEN RETURN NEW; END IF;
    IF NOT (NEW.status = ANY(valid_next)) THEN
        RAISE EXCEPTION 'Invalid status transition: % -> %', OLD.status, NEW.status;
    END IF;

    RETURN NEW;
END;
$$;


-- TRIGGERS

CREATE TRIGGER trg_order_total AFTER INSERT OR UPDATE OR DELETE ON order_items
FOR EACH ROW EXECUTE FUNCTION recalc_order_total();

CREATE OR REPLACE TRIGGER hotel_tables_updated_at BEFORE UPDATE ON hotel_tables
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER order_updated_at BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER order_items_updated_at BEFORE UPDATE ON order_items
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER order_payments_updated_at BEFORE UPDATE ON order_payments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_order_status_guard BEFORE UPDATE OF status ON orders
FOR EACH ROW EXECUTE FUNCTION guard_order_status();

-- PUBLICATIONS

ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;

