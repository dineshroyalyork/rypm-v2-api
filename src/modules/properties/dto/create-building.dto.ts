// src/modules/properties/dto/create-building.dto.ts
import { z } from 'zod';

export const createBuildingSchema = z.object({
  building_id: z.string().optional(),
  Owner: z
    .object({
      name: z.string().optional(),
      id: z.string().optional(),
      email: z.string().optional(),
    })
    .optional(),
  Checked_for_Deletion_Status: z.boolean().optional(),
  Remote_Garage: z.boolean().optional(),
  Address: z.string().optional(),
  RMA_Expiry_Date: z.any().optional(),
  Elevators: z.boolean().optional(),
  has_golf_range: z.boolean().optional(),
  Verified: z.boolean().optional(),
  Water_Filtration_Softener_Rental: z.boolean().optional(),
  Currency: z.string().optional(),
  Postal_Code: z.string().optional(),
  Pet_Restrictions: z.boolean().optional(),
  has_cabana: z.boolean().optional(),
  Heat_Included1: z.boolean().optional(),
  Office_Phone_Number: z.string().optional(),
  Laundry_Facilities: z.boolean().optional(),
  Internet_Included: z.boolean().optional(),
  Parking_Garage: z.boolean().optional(),
  Created_Time: z.string().optional(),
  Date_of_Construction: z.any().optional(),
  Longitude: z.string().optional(),
  Rec_Room: z.boolean().optional(),
  Setup_Fee_Property_Management: z.any().optional(),
  Electric_Car_Charging_Stations: z.boolean().optional(),
  Concierge_Building_Management_Info: z.any().optional(),
  Day_Care_Centre: z.boolean().optional(),
  Geocoding_Quality: z.any().optional(),
  Country: z.any().optional(),
  Created_By: z
    .object({
      name: z.string().optional(),
      id: z.string().optional(),
      email: z.string().optional(),
    })
    .optional(),
  Building_Marketing_Description: z.any().optional(),
  hot_water_tank_provider: z.any().optional(),
  gas_provider: z.any().optional(),
  Building_Folder_ID: z.string().optional(),
  Flat_Fee_Utilities: z.any().optional(),
  has_whirlpool: z.boolean().optional(),
  has_squash_court: z.boolean().optional(),
  has_bowling_alley: z.boolean().optional(),
  has_tennis_court: z.boolean().optional(),
  mapquest_id: z.any().optional(),
  Indoor_Child_Play_Area: z.boolean().optional(),
  Added_to_TP: z.string().optional(),
  Corporation_Number: z.any().optional(),
  Enter_Phone_System: z.boolean().optional(),
  utility_notes: z.any().optional(),
  Sync_with_Owner_Portal: z.boolean().optional(),
  Office_Address: z.any().optional(),
  has_basketball_court: z.boolean().optional(),
  Duplicate_Check: z.boolean().optional(),
  Cable_Included: z.boolean().optional(),
  management_start_date: z.any().optional(),
  Locked__s: z.boolean().optional(),
  has_movie_theater: z.boolean().optional(),
  has_billiards_room: z.boolean().optional(),
  has_yoga_room: z.boolean().optional(),
  has_steam_room: z.boolean().optional(),
  has_sauna: z.boolean().optional(),
  has_pool: z.boolean().optional(),
  has_outdoor_pool: z.boolean().optional(),
  pet_spa: z.boolean().optional(),
  has_fitness_center: z.boolean().optional(),
  has_meeting_room: z.boolean().optional(),
  has_ventilation_hood: z.boolean().optional(),
  Outdoor_Patio: z.boolean().optional(),
  has_rooftop_patio: z.boolean().optional(),
  has_party_room: z.boolean().optional(),
  has_bbq_terrace: z.boolean().optional(),
  has_lobby_lounge: z.boolean().optional(),
  has_guest_suites: z.boolean().optional(),
  has_business_centre: z.boolean().optional(),
  has_game_room: z.boolean().optional(),
  has_bicycle_storage: z.boolean().optional(),
  car_wash: z.boolean().optional(),
  AC_Included1: z.boolean().optional(),
  hydro_provider: z.any().optional(),
  water_provider: z.any().optional(),
  rma_effective_date: z.any().optional(),
  rma_duration: z.any().optional(),
  rma_signed_by_owner: z.boolean().optional(),
  developer_name: z.any().optional(),
  kijiji_data_importer: z.boolean().optional(),
  public_transit: z.boolean().optional(),
  has_security: z.boolean().optional(),
  has_subway_access: z.boolean().optional(),
  Modified_Time: z.string().optional(),
  Last_Activity_Time: z.string().optional(),
  Unsubscribed_Time: z.string().optional(),
  update_building_workflow_automations: z.boolean().optional(),
  zoho_sign_rma_request_id: z.any().optional(),
  visitor_parking: z.boolean().optional(),
  wheelchair_access: z.boolean().optional(),
  keyless_entry: z.boolean().optional(),
  security_onsite: z.boolean().optional(),
  onsite_staff: z.boolean().optional(),
  outdoor_child_play_area: z.boolean().optional(),
  library: z.boolean().optional(),
  piano_lounge: z.boolean().optional(),
  Territory: z
    .object({
      name: z.string().optional(),
      id: z.string().optional(),
    })
    .optional(),
  territory_id: z.any().optional(),
  territory_search_result: z.any().optional(),
  exchange_rate: z.number().optional(),
  Modified_By: z
    .object({
      name: z.string().optional(),
      id: z.string().optional(),
      email: z.string().optional(),
    })
    .optional(),
  name: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  latitude: z.string().optional(),
  property_type: z.string().optional(),
  category: z.string().optional(),
  year_built1: z.string().optional(),
  floor_count: z.string().optional(),
  unit_count: z.string().optional(),
  unit_name: z.string().optional(),
  property_management_contact_email: z.string().optional(),
});

export type CreateBuildingDto = z.infer<typeof createBuildingSchema>;
