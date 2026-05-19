ALTER TABLE public.plan_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plan_limits: public read" ON public.plan_limits FOR SELECT USING (true);



ALTER TABLE public.plan_limits 
ADD COLUMN max_qr_codes integer NOT NULL DEFAULT 3
CHECK (max_qr_codes = -1 OR max_qr_codes > 0);


UPDATE public.plan_limits SET max_qr_codes = 3 WHERE plan = 'basic';
UPDATE public.plan_limits SET max_qr_codes = 15 WHERE plan = 'starter';
UPDATE public.plan_limits SET max_qr_codes = -1 WHERE plan = 'growth';
UPDATE public.plan_limits SET max_qr_codes = -1 WHERE plan = 'pro';
