alter type "public"."restaurant_type" rename to "restaurant_type__old_version_to_be_dropped";

create type "public"."restaurant_type" as enum ('restaurant', 'cafe', 'bakery', 'food_court', 'cloud_kitchen', 'bar_restaurant', 'hotel_restaurant');

drop type "public"."restaurant_type__old_version_to_be_dropped";

alter table "public"."categories" add column "icon" text;

alter table "public"."hotels" alter column "cuisine_type" set data type text[] using "cuisine_type"::text[];

alter table "public"."hotels" alter column "restaurant_type" set data type text[] using "restaurant_type"::text[];

alter table "public"."hotels" alter column "service_type" set data type text[] using "service_type"::text[];

alter table "public"."menu_items" add column "dietary_type" text;

alter table "public"."menu_items" add column "variants" text[];

alter table "public"."menu_items" alter column "image_url" set data type text using "image_url"::text;

alter table "public"."menu_items" alter column "spice_level" drop default;

alter table "public"."menu_items" alter column "spice_level" set data type text using "spice_level"::text;

alter table "public"."subscriptions" add column "hotel_id" uuid not null;

drop type "public"."cuisine_type";

drop type "public"."service_type";

CREATE UNIQUE INDEX hotels_owner_id_key ON public.hotels USING btree (owner_id);

CREATE UNIQUE INDEX subscriptions_hotel_id_key ON public.subscriptions USING btree (hotel_id);

alter table "public"."hotels" add constraint "hotels_owner_id_key" UNIQUE using index "hotels_owner_id_key";

alter table "public"."subscriptions" add constraint "subscriptions_hotel_id_fkey" FOREIGN KEY (hotel_id) REFERENCES public.hotels(id) ON UPDATE RESTRICT ON DELETE RESTRICT not valid;

alter table "public"."subscriptions" validate constraint "subscriptions_hotel_id_fkey";

alter table "public"."subscriptions" add constraint "subscriptions_hotel_id_key" UNIQUE using index "subscriptions_hotel_id_key";


