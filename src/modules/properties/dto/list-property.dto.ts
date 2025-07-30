import { z } from 'zod';

// Properties fields
export const propertyFieldsSchema = z.object({
  // Basic Information
  zcrm_id: z.string().optional(),
  available_date: z.string().optional(),
  property_condition: z.string().optional(),
  basement_details: z.string().optional(),
  basement_included: z.string().optional(),
  total_area_sq_ft: z.number().optional(),
  number_of_floors: z.number().optional(),
  property_type: z.string().optional(),
  name: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  marketed_price: z.number().optional(),
  
  // Common Area Features
  fireplace: z.boolean().optional(),
  window_coverings: z.string().optional(),
  flooring_common_area: z.string().optional(),
  ceiling_hight: z.string().optional(),
  
  // Bedroom Features
  bedrooms: z.string().optional(),
  bedroom_layout: z.string().optional(),
  closets: z.string().optional(),
  en_suite_bathrooms: z.string().optional(),
  fireplace_bedroom: z.boolean().optional(),
  den_can_be_used_as_a_bedroom: z.boolean().optional(),
  
  // Bathroom Features
  bathrooms: z.string().optional(),
  shower_type: z.string().optional(),
  upgraded_bathrooms: z.boolean().optional(),
  countertops_bathroom: z.string().optional(),
  
  // Laundry & HVAC
  central_hvac: z.string().optional(),
  heating_ac_unit: z.string().optional(),
  heated_floors: z.boolean().optional(),
  washer_dryer: z.string().optional(),
  
  // Appliance Brands - Laundry & HVAC
  furnace: z.string().optional(),
  hot_water_heater_manufacturer: z.string().optional(),
  washer_and_dryer: z.string().optional(),
  air_conditioning_manufacturer: z.string().optional(),
  
  // Kitchen Features
  countertops: z.string().optional(),
  dishwasher: z.boolean().optional(),
  upgraded_kitchen: z.boolean().optional(),
  appliance_finishes: z.string().optional(),
  new_ice_maker: z.boolean().optional(),
  upgraded_back_splash: z.boolean().optional(),
  thumbnail_image: z.string().optional(),
  
  // Appliance Brands - Kitchen
  refrigerator_manufacture: z.string().optional(),
  stove_oven: z.string().optional(),
  dishwasher_manufacture: z.string().optional(),
  microwave_manufacture: z.string().optional(),
  cooktop_manufacture: z.string().optional(),
  ventilation_hood_manufacture: z.string().optional(),
  dryer_manufacture: z.string().optional(),
  
  // Coordinates
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  
  // Laundry Features
  washer_dryer_in_unit: z.boolean().optional(),
  
  // Tenant Information
  tenant_id: z.string().optional(),
});

// Property Details fields
export const propertyDetailsFieldsSchema = z.object({
  // Owner Information
  owner: z.any().optional(),
  
  // Financial Information
  tenant_prospect_marketed_price_multiplied: z.number().optional(),
  daily_rent: z.number().optional(),
  currency: z.string().optional(),
  setup_fee: z.number().optional(),
  management_fees: z.number().optional(),
  
  // Booking & Showing
  link_to_automatically_book_showing: z.string().optional(),
  important_information_for_booking_showing: z.string().optional(),
  
  // Features
  outdoor_pool: z.boolean().optional(),
  unit_owner_deal: z.boolean().optional(),
  huge_private_terrace: z.boolean().optional(),
  heat_inclusion: z.boolean().optional(),
  carbon_monoxide_detector: z.boolean().optional(),
  internet_inclusion: z.boolean().optional(),
  private_garage: z.boolean().optional(),
  tons_of_natural_light: z.boolean().optional(),
  central_vaccum: z.boolean().optional(),
  ac_inclusion: z.boolean().optional(),
  corner_unit: z.boolean().optional(),
  walk_in_closets: z.boolean().optional(),
  phone_inclusion: z.boolean().optional(),
  
  // Contact Information
  client_support_specialist: z.string().optional(),
  noe_contact: z.string().optional(),
  email: z.string().optional(),
  
  // Location & Address
  postal_code: z.string().optional(),
  neighbourhood: z.string().optional(),
  view: z.string().optional(),
  
  // Management
  management_start_date: z.string().optional(),
  management_end_date: z.string().optional(),
  management_deal_created: z.boolean().optional(),
  date_under_management: z.string().optional(),
  
  // Marketing & Advertising
  ad_description_with_parking_and_locker: z.string().optional(),
  posting_title_with_parking_and_locker: z.string().optional(),
  email_description: z.string().optional(),
  social_media_description: z.string().optional(),
  meta_description: z.string().optional(),
  
  // Social Media
  linkedin: z.string().optional(),
  google_my_business: z.string().optional(),
  instagram: z.string().optional(),
  youtube_video: z.string().optional(),
  
  // Property Details
  unit_type: z.string().optional(),
  unit_category: z.string().optional(),
  appliances: z.string().optional(),
  flooring_in_bedrooms: z.string().optional(),
  storage_details: z.string().optional(),
  parking_details: z.string().optional(),
  locker_level_and_number: z.string().optional(),
  backyard: z.string().optional(),
  is_the_backyard_fenced: z.string().optional(),
  
  // Utilities & Services
  gas_provider: z.string().optional(),
  furnace_filter: z.string().optional(),
  hot_water_tank_provider: z.string().optional(),
  washer_manufacture: z.string().optional(),
  refrigerator_manufacture: z.string().optional(),
  
  // Safety & Security
  smoke_alarm_1: z.string().optional(),
  fire_extinguisher1: z.string().optional(),
  
  // Insurance & Legal
  insurance_policy_number: z.string().optional(),
  insurance_home_owner: z.string().optional(),
  create_legal_file: z.boolean().optional(),
  
  // Occupancy
  max_occupants: z.number().optional(),
  
  // Status & Activity
  synced_web_tp: z.boolean().optional(),
  point2homes: z.string().optional(),
  fully_marketed: z.boolean().optional(),
  publish_to_rypm_website: z.string().optional(),
  website_verified: z.string().optional(),
  unsubscribed_mode: z.string().optional(),
  active_1_10_days: z.boolean().optional(),
  update_portfolio: z.boolean().optional(),
  kijiji_data_importer: z.boolean().optional(),
  
  // Dates
  tenant_cons_email_last_sent: z.string().optional(),
  noe_vacancy_date: z.string().optional(),
  noe_date_and_time_from_owner_portal: z.string().optional(),
  closing_date: z.string().optional(),
  when_was_the_property_leased: z.string().optional(),
  scheduled_photos_and_video: z.string().optional(),
  flushing_of_drain_work_order: z.boolean().optional(),
  modified_time: z.string().optional(),
  last_activity_time: z.string().optional(),
  
  // Communication
  communication: z.string().optional(),
  tp_response: z.string().optional(),
  
  // Tasks & Records
  create_task_temporary: z.boolean().optional(),
  task_temporary_2: z.boolean().optional(),
  creator_record_id: z.string().optional(),
  
  // Territory
  territory: z.any().optional(),
  
  // Exchange Rate
  exchange_rate: z.number().optional(),
  
  // Modified By
  modified_by: z.any().optional(),
  
  // Unit URL
  unit_url: z.string().optional(),
});

  // Buildings fields
  export const buildingFieldsSchema = z.object({
    // Basic Information
    building_id: z.string().optional(),
    building_property_id: z.string().optional(), // Will be auto-generated if not provided
  name: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  
  // Building Details
  property_type: z.string().optional(),
  category: z.string().optional(),
  year_built1: z.number().optional(),
  date_of_construction: z.string().optional(),
  floor_count: z.number().optional(),
  unit_count: z.number().optional(),
  unit_name: z.string().optional(),
  
  // Contact Information
  office_phone_number: z.string().optional(),
  office_address: z.string().optional(),
  property_management_contact_email: z.string().optional(),
  
  // Ownership & Management
  owner: z.any().optional(),
  created_by: z.any().optional(),
  modified_by: z.any().optional(),
  territory: z.any().optional(),
  territory_id: z.string().optional(),
  territory_search_result: z.string().optional(),
  
  // Financial Information
  currency: z.string().optional(),
  exchange_rate: z.number().optional(),
  setup_fee_property_management: z.number().optional(),
  flat_fee_utilities: z.string().optional(),
  
  // Building Features
  elevators: z.boolean().optional(),
  parking_garage: z.boolean().optional(),
  remote_garage: z.boolean().optional(),
  visitor_parking: z.boolean().optional(),
  electric_car_charging_stations: z.boolean().optional(),
  wheelchair_access: z.boolean().optional(),
  keyless_entry: z.boolean().optional(),
  security_onsite: z.boolean().optional(),
  onsite_staff: z.boolean().optional(),
  
  // Amenities
  laundry_facilities: z.boolean().optional(),
  rec_room: z.boolean().optional(),
  day_care_centre: z.boolean().optional(),
  indoor_child_play_area: z.boolean().optional(),
  outdoor_child_play_area: z.boolean().optional(),
  library: z.boolean().optional(),
  piano_lounge: z.boolean().optional(),
  concierge_building_management_info: z.string().optional(),
  
  // Sports & Recreation
  has_golf_range: z.boolean().optional(),
  has_tennis_court: z.boolean().optional(),
  has_basketball_court: z.boolean().optional(),
  has_squash_court: z.boolean().optional(),
  has_bowling_alley: z.boolean().optional(),
  has_movie_theater: z.boolean().optional(),
  has_billiards_room: z.boolean().optional(),
  has_yoga_room: z.boolean().optional(),
  
  // Wellness & Spa
  has_whirlpool: z.boolean().optional(),
  has_steam_room: z.boolean().optional(),
  has_sauna: z.boolean().optional(),
  has_pool: z.boolean().optional(),
  has_outdoor_pool: z.boolean().optional(),
  pet_spa: z.boolean().optional(),
  has_fitness_center: z.boolean().optional(),
  has_meeting_room: z.boolean().optional(),
  has_ventilation_hood: z.boolean().optional(),
  outdoor_patio: z.boolean().optional(),
  
  // Social Spaces
  has_cabana: z.boolean().optional(),
  has_rooftop_patio: z.boolean().optional(),
  has_party_room: z.boolean().optional(),
  has_bbq_terrace: z.boolean().optional(),
  has_lobby_lounge: z.boolean().optional(),
  has_guest_suites: z.boolean().optional(),
  has_business_centre: z.boolean().optional(),
  has_game_room: z.boolean().optional(),
  
  // Storage & Parking
  has_bicycle_storage: z.boolean().optional(),
  car_wash: z.boolean().optional(),
  
  // Utilities & Services
  heat_included1: z.boolean().optional(),
  ac_included1: z.boolean().optional(),
  internet_included: z.boolean().optional(),
  cable_included: z.boolean().optional(),
  water_filtration_softener_rental: z.boolean().optional(),
  hot_water_tank_provider: z.string().optional(),
  gas_provider: z.string().optional(),
  hydro_provider: z.string().optional(),
  water_provider: z.string().optional(),
  utility_notes: z.string().optional(),
});

// Main List Property Schema
export const listPropertySchema = z.object({
  // Property fields
  ...propertyFieldsSchema.shape,
  
  // Property Details fields
  ...propertyDetailsFieldsSchema.shape,
  
  // Building fields
  ...buildingFieldsSchema.shape,
});

export type ListPropertyDto = z.infer<typeof listPropertySchema>; 