-- public.users.is_verified was whatever the client wrote. Both auth callbacks
-- hard-coded true, and the "users: update own row" policy lets any signed-in
-- user PATCH their own row through the REST API, so the flag could be set with
-- no email ever confirmed.
--
-- It now mirrors auth.users.email_confirmed_at, which only Supabase Auth
-- writes. Any value a client sends is overwritten.

CREATE OR REPLACE FUNCTION public.sync_is_verified_from_auth()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.is_verified := COALESCE(
    (SELECT au.email_confirmed_at IS NOT NULL FROM auth.users au WHERE au.id = NEW.id),
    false
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS users_is_verified_from_auth ON public.users;
CREATE TRIGGER users_is_verified_from_auth
  BEFORE INSERT OR UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_is_verified_from_auth();

-- Keep the mirror current when Supabase confirms (or re-confirms) an address
-- after the profile row already exists.
CREATE OR REPLACE FUNCTION public.propagate_email_confirmation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.users
     SET is_verified = (NEW.email_confirmed_at IS NOT NULL)
   WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_email_confirmed ON auth.users;
CREATE TRIGGER on_auth_email_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS DISTINCT FROM NEW.email_confirmed_at)
  EXECUTE FUNCTION public.propagate_email_confirmation();

REVOKE ALL ON FUNCTION public.sync_is_verified_from_auth() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.propagate_email_confirmation() FROM PUBLIC, anon, authenticated;

-- Correct rows written before this migration. The BEFORE UPDATE trigger does
-- the actual work; touching every row is enough to fire it.
UPDATE public.users SET is_verified = is_verified;
