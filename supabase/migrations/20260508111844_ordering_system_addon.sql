DO $$
BEGIN
    IF NOT EXISTS(
        SELECT 1
        FROM pg_type
        WHERE typname="order_status"
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

CREATE TABLE IF NOT EXISTS public.hotel_tables (
    "id" "uuid" PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"(),
    "hotel_id" "uuid" NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    "table_number" integer NOT NULL,
    "label" varchar(50),
    "is_active" boolean NOT NULL DEFAULT true,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),

    UNIQUE("hotel_id", "table_number")
)


CREATE TABLE IF NOT EXISTS public.orders (
    "id" "uuid" PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"(),

    "hotel_id" "uuid" NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,

    "table_id" "uuid" NOT NULL REFERENCES public.hotel_tables(id) ON DELETE SET NULL,

    "customer_name" varchar(120),
    "customer_phone" varchar(20),

    "status" public.order_status NOT NULL DEFAULT "pending",

    "total_amount" numeric(10,2) NOT NULL CHECK (total_amount >= 0),

    "notes" varchar(1000),

    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now() 
);


CREATE OR REPLACE TRIGGER hotel_tables_updated_at BEFORE UPDATE ON hotel_tables
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER order_updated_at BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS public.order_items(
    "id" "uuid" PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"(),

    "order_id" "uuid" NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,

    "menu_item_id" "uuid" NOT NULL REFERENCES public.menu_items(id) ON DELETE RESTRICT,

    "quantity" integer NOT NULL CHECK (quantity > 0),

    "item_name"
)