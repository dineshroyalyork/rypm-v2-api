import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { CreateBuildingDto } from '../dto/create-building.dto';

@Injectable()
export class BuildingsService {
  constructor(private readonly prisma: PrismaService) {}

  private static readonly zohoToPrismaMap: Record<string, string> = {
    building_id: 'building_id',
    Owner: 'owner',
    Checked_for_Deletion_Status: 'checked_for_deletion_status',
    Remote_Garage: 'remote_garage',
    Address: 'address',
    RMA_Expiry_Date: 'rma_expiry_date',
    Elevators: 'elevators',
    has_golf_range: 'has_golf_range',
    Verified: 'verified',
    Water_Filtration_Softener_Rental: 'water_filtration_softener_rental',
    Currency: 'currency',
    Postal_Code: 'postal_code',
    Pet_Restrictions: 'pet_restrictions',
    has_cabana: 'has_cabana',
    Heat_Included1: 'heat_included1',
    Office_Phone_Number: 'office_phone_number',
    Laundry_Facilities: 'laundry_facilities',
    Internet_Included: 'internet_included',
    Parking_Garage: 'parking_garage',
    Created_Time: 'created_time',
    Date_of_Construction: 'date_of_construction',
    Longitude: 'longitude',
    Rec_Room: 'rec_room',
    Setup_Fee_Property_Management: 'setup_fee_property_management',
    Electric_Car_Charging_Stations: 'electric_car_charging_stations',
    Concierge_Building_Management_Info: 'concierge_building_management_info',
    Day_Care_Centre: 'day_care_centre',
    Geocoding_Quality: 'geocoding_quality',
    Country: 'country',
    Created_By: 'created_by',
    Building_Marketing_Description: 'building_marketing_description',
    hot_water_tank_provider: 'hot_water_tank_provider',
    gas_provider: 'gas_provider',
    Building_Folder_ID: 'building_folder_id',
    Flat_Fee_Utilities: 'flat_fee_utilities',
    has_whirlpool: 'has_whirlpool',
    has_squash_court: 'has_squash_court',
    has_bowling_alley: 'has_bowling_alley',
    has_tennis_court: 'has_tennis_court',
    mapquest_id: 'mapquest_id',
    Indoor_Child_Play_Area: 'indoor_child_play_area',
    Added_to_TP: 'added_to_tp',
    Corporation_Number: 'corporation_number',
    Enter_Phone_System: 'enter_phone_system',
    utility_notes: 'utility_notes',
    Sync_with_Owner_Portal: 'sync_with_owner_portal',
    Office_Address: 'office_address',
    has_basketball_court: 'has_basketball_court',
    Duplicate_Check: 'duplicate_check',
    Cable_Included: 'cable_included',
    management_start_date: 'management_start_date',
    Locked__s: 'locked_s',
    has_movie_theater: 'has_movie_theater',
    has_billiards_room: 'has_billiards_room',
    has_yoga_room: 'has_yoga_room',
    has_steam_room: 'has_steam_room',
    has_sauna: 'has_sauna',
    has_pool: 'has_pool',
    has_outdoor_pool: 'has_outdoor_pool',
    pet_spa: 'pet_spa',
    has_rooftop_patio: 'has_rooftop_patio',
    has_party_room: 'has_party_room',
    has_bbq_terrace: 'has_bbq_terrace',
    has_lobby_lounge: 'has_lobby_lounge',
    has_guest_suites: 'has_guest_suites',
    has_business_centre: 'has_business_centre',
    has_game_room: 'has_game_room',
    has_bicycle_storage: 'has_bicycle_storage',
    car_wash: 'car_wash',
    AC_Included1: 'ac_included1',
    hydro_provider: 'hydro_provider',
    water_provider: 'water_provider',
    rma_effective_date: 'rma_effective_date',
    rma_duration: 'rma_duration',
    rma_signed_by_owner: 'rma_signed_by_owner',
    developer_name: 'developer_name',
    kijiji_data_importer: 'kijiji_data_importer',
    public_transit: 'public_transit',
    has_security: 'has_security',
    has_subway_access: 'has_subway_access',
    Modified_Time: 'modified_time',
    Last_Activity_Time: 'last_activity_time',
    Unsubscribed_Time: 'unsubscribed_time',
    update_building_workflow_automations:
      'update_building_workflow_automations',
    zoho_sign_rma_request_id: 'zoho_sign_rma_request_id',
    visitor_parking: 'visitor_parking',
    wheelchair_access: 'wheelchair_access',
    keyless_entry: 'keyless_entry',
    security_onsite: 'security_onsite',
    onsite_staff: 'onsite_staff',
    outdoor_child_play_area: 'outdoor_child_play_area',
    library: 'library',
    piano_lounge: 'piano_lounge',
    Territory: 'territory',
    territory_id: 'territory_id',
    territory_search_result: 'territory_search_result',
    exchange_rate: 'exchange_rate',
    Modified_By: 'modified_by',
    name: 'name',
    city: 'city',
    province: 'province',
    latitude: 'latitude',
    property_type: 'property_type',
    category: 'category',
    year_built1: 'year_built1',
    floor_count: 'floor_count',
    unit_count: 'unit_count',
    unit_name: 'unit_name',
    property_management_contact_email: 'property_management_contact_email',
    has_fitness_center: 'has_fitness_center',
    Outdoor_Patio: 'outdoor_patio',
  };

  private transformZohoToPrisma(zohoData: CreateBuildingDto) {
    const buildingData: Record<string, any> = {};

    for (const [zohoKey, value] of Object.entries(zohoData)) {
      const prismaKey = BuildingsService.zohoToPrismaMap[zohoKey];

      if (prismaKey) {
        buildingData[prismaKey] = value;
      }
    }

    return buildingData;
  }

  async create(args: CreateBuildingDto) {
    try {
      const buildingData = this.transformZohoToPrisma(args);

      const building = await this.prisma.building.create({
        data: buildingData as any,
      });

      return {
        statusCode: 201,
        data: building,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(error.message);
      } else {
        console.error('Internal server error:', error);
        throw new InternalServerErrorException('Internal server error');
      }
    }
  }
}
