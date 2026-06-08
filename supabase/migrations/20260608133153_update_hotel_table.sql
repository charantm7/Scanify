
CREATE TYPE restaurant_type as enum (
    'restaurant',
    'cafe',
    'bar',
    'pub',
    'food_truck',
    'bakery',
    'cloud_kitchen',
    'fine_dining',
    'casual_dining',
    'buffet',
    'fast_food',
    'bistro'
);


CREATE TYPE cuisine_type as enum (
    'indian',
    'north_indian',
    'south_indian',
    'chinese',
    'italian',
    'mexican',
    'thai',
    'japanese',
    'korean',
    'continental',
    'american',
    'mediterranean',
    'french',
    'arabian',
    'turkish',
    'seafood',
    'vegetarian',
    'vegan',
    'desserts',
    'multi_cuisine'
);

CREATE TYPE service_type as enum (
    'dine_in',
    'takeaway',
    'delivery',
    'drive_through',
    'curbside_pickup',
    'reservation_only',
    'catering'
);


ALTER TABLE public.hotels
ADD COLUMN restaurant_type restaurant_type,
ADD COLUMN service_type service_type[],
ADD COLUMN cuisine_type cuisine_type[];