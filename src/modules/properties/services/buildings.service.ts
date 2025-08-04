import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { parseCsvStringToJson } from '../../../../shared/utils/csv';
import { CreateBuildingDto } from '../dto/create-building.dto';

@Injectable()
export class BuildingsService {
  constructor(private readonly prisma: PrismaService) {}

  private static readonly zohoToPrismaMap: Record<string, string> = {
    building_id: 'building_id',
    id: 'building_property_id',
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
    update_building_workflow_automations: 'update_building_workflow_automations',
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

  // CSV to Prisma mapping - only includes fields that exist in the schema
  private static readonly csvToPrismaMap: Record<string, string> = {
    // Basic Information
    Id: 'building_property_id', // CSV Id maps to building_property_id
    building_id: 'building_id',
    Name: 'name',
    Address: 'address',
    City: 'city',
    Province: 'province',
    Country: 'country',
    Postal_Code: 'postal_code',
    Latitude: 'latitude',
    Longitude: 'longitude',

    // Building Details
    Property_Type: 'property_type',
    Category: 'category',
    Year_Built: 'year_built1',
    Year_Built1: 'year_built1',
    Date_of_Construction: 'date_of_construction',
    floor_count: 'floor_count',
    unit_count: 'unit_count',
    unit_name: 'unit_name',

    // Contact Information
    Office_Phone_Number: 'office_phone_number',
    Office_Address: 'office_address',
    Property_Management_Contact_Email: 'property_management_contact_email',

    // Ownership & Management - JSON fields
    Owner: 'owner',
    Created_By: 'created_by',
    Modified_By: 'modified_by',
    Territory: 'territory',
    Territory_ID: 'territory_id',
    Territory_Search_Result: 'territory_search_result',

    // Financial Information
    Currency: 'currency',
    Exchange_Rate: 'exchange_rate',
    Setup_Fee_Property_Management: 'setup_fee_property_management',
    Flat_Fee_Utilities: 'flat_fee_utilities',

    // Building Features - Boolean fields
    Elevators: 'elevators',
    Parking_Garage: 'parking_garage',
    Remote_Garage: 'remote_garage',
    Visitor_Parking: 'visitor_parking',
    Electric_Car_Charging_Stations: 'electric_car_charging_stations',
    Wheelchair_Access: 'wheelchair_access',
    Keyless_Entry: 'keyless_entry',
    Security_Onsite: 'security_onsite',
    Onsite_Staff: 'onsite_staff',

    // Amenities - Boolean fields
    Laundry_Facilities: 'laundry_facilities',
    Rec_Room: 'rec_room',
    Day_Care_Centre: 'day_care_centre',
    Indoor_Child_Play_Area: 'indoor_child_play_area',
    Outdoor_Child_Play_Area: 'outdoor_child_play_area',
    Library: 'library',
    Piano_Lounge: 'piano_lounge',
    Concierge_Building_Management_Info: 'concierge_building_management_info',

    // Sports & Recreation - Boolean fields
    has_golf_range: 'has_golf_range',
    has_tennis_court: 'has_tennis_court',
    has_basketball_court: 'has_basketball_court',
    has_squash_court: 'has_squash_court',
    has_bowling_alley: 'has_bowling_alley',
    has_movie_theater: 'has_movie_theater',
    has_billiards_room: 'has_billiards_room',
    has_yoga_room: 'has_yoga_room',

    // Wellness & Spa - Boolean fields
    has_whirlpool: 'has_whirlpool',
    has_steam_room: 'has_steam_room',
    has_sauna: 'has_sauna',
    has_pool: 'has_pool',
    has_outdoor_pool: 'has_outdoor_pool',
    pet_spa: 'pet_spa',
    has_fitness_center: 'has_fitness_center',
    has_meeting_room: 'has_meeting_room',
    has_ventilation_hood: 'has_ventilation_hood',
    outdoor_patio: 'outdoor_patio',

    // Social Spaces - Boolean fields
    has_cabana: 'has_cabana',
    has_rooftop_patio: 'has_rooftop_patio',
    has_party_room: 'has_party_room',
    has_bbq_terrace: 'has_bbq_terrace',
    has_lobby_lounge: 'has_lobby_lounge',
    has_guest_suites: 'has_guest_suites',
    has_business_centre: 'has_business_centre',
    has_game_room: 'has_game_room',

    // Storage & Parking - Boolean fields
    has_bicycle_storage: 'has_bicycle_storage',
    Car_Wash: 'car_wash',

    // Utilities & Services - Boolean fields
    Heat_Included1: 'heat_included1',
    AC_Included1: 'ac_included1',
    Internet_Included: 'internet_included',
    Cable_Included: 'cable_included',
    Water_Filtration_Softener_Rental: 'water_filtration_softener_rental',
    hot_water_tank_provider: 'hot_water_tank_provider',
    gas_provider: 'gas_provider',
    hydro_provider: 'hydro_provider',
    water_provider: 'water_provider',
    utility_notes: 'utility_notes',

    // Management & Legal
    management_start_date: 'management_start_date',
    RMA_Effective_Date: 'rma_effective_date',
    RMA_Expiry_Date: 'rma_expiry_date',
    RMA_Duration: 'rma_duration',
    RMA_Signed_by_Owner: 'rma_signed_by_owner',
    Corporation_Number: 'corporation_number',
    Developer_Name: 'developer_name',

    // Marketing & Listing
    Building_Marketing_Description: 'building_marketing_description',
    Added_to_TP: 'added_to_tp',
    Kijiji_Data_Importer: 'kijiji_data_importer',
    Building_Folder_ID: 'building_folder_id',

    // Status & Flags - Boolean fields
    Checked_for_Deletion_Status: 'checked_for_deletion_status',
    Verified: 'verified',
    Duplicate_Check: 'duplicate_check',
    Locked__s: 'locked_s',
    Pet_Restrictions: 'pet_restrictions',
    Public_Transit: 'public_transit',
    has_security: 'has_security',
    has_subway_access: 'has_subway_access',

    // Timestamps
    Created_Time: 'created_time',
    Modified_Time: 'modified_time',
    Last_Activity_Time: 'last_activity_time',
    Unsubscribed_Time: 'unsubscribed_time',

    // Additional Fields
    mapquest_id: 'mapquest_id',
    Geocoding_Quality: 'geocoding_quality',
    Enter_Phone_System: 'enter_phone_system',
    Sync_with_Owner_Portal: 'sync_with_owner_portal',
    Update_Building_workflow_automations: 'update_building_workflow_automations',
    Zoho_Sign_RMA_RequestID: 'zoho_sign_rma_request_id',
  };

  private transformCsvData(csvRecord: Record<string, any>) {
    // First, map CSV field names to Prisma field names using the CSV mapping
    const mappedRecord: Record<string, any> = {};

    for (const [csvField, value] of Object.entries(csvRecord)) {
      const prismaField = BuildingsService.csvToPrismaMap[csvField];
      if (prismaField) {
        mappedRecord[prismaField] = value;
      }
      // Skip fields that don't exist in the schema
    }

    const transformedRecord = { ...mappedRecord };

    // Handle JSON fields - convert string values to JSON objects
    const jsonFields = ['owner', 'created_by', 'modified_by', 'territory'];
    jsonFields.forEach(field => {
      if (transformedRecord[field] && typeof transformedRecord[field] === 'string') {
        try {
          // If it's already a JSON string, parse it
          if (transformedRecord[field].startsWith('{') || transformedRecord[field].startsWith('[')) {
            transformedRecord[field] = JSON.parse(transformedRecord[field]);
          } else {
            // If it's a simple string (like an ID), create a proper JSON object
            transformedRecord[field] = {
              id: transformedRecord[field],
              name: '',
              email: '',
            };
          }
        } catch (error) {
          // If parsing fails, create a proper JSON object
          transformedRecord[field] = {
            id: transformedRecord[field],
            name: '',
            email: '',
          };
        }
      }
    });

    // Convert string booleans to actual booleans - all boolean fields from buildings schema
    const booleanFields = [
      'elevators',
      'parking_garage',
      'remote_garage',
      'visitor_parking',
      'electric_car_charging_stations',
      'wheelchair_access',
      'keyless_entry',
      'security_onsite',
      'onsite_staff',
      'laundry_facilities',
      'rec_room',
      'day_care_centre',
      'indoor_child_play_area',
      'outdoor_child_play_area',
      'library',
      'piano_lounge',
      'has_golf_range',
      'has_tennis_court',
      'has_basketball_court',
      'has_squash_court',
      'has_bowling_alley',
      'has_movie_theater',
      'has_billiards_room',
      'has_yoga_room',
      'has_whirlpool',
      'has_steam_room',
      'has_sauna',
      'has_pool',
      'has_outdoor_pool',
      'pet_spa',
      'has_cabana',
      'has_rooftop_patio',
      'has_party_room',
      'has_bbq_terrace',
      'has_lobby_lounge',
      'has_guest_suites',
      'has_business_centre',
      'has_game_room',
      'has_bicycle_storage',
      'car_wash',
      'heat_included1',
      'ac_included1',
      'internet_included',
      'cable_included',
      'water_filtration_softener_rental',
      'checked_for_deletion_status',
      'verified',
      'duplicate_check',
      'locked_s',
      'pet_restrictions',
      'public_transit',
      'has_security',
      'has_subway_access',
      'enter_phone_system',
      'sync_with_owner_portal',
      'update_building_workflow_automations',
      'rma_signed_by_owner',
      'kijiji_data_importer',
      'has_fitness_center',
      'outdoor_patio',
    ];

    booleanFields.forEach(field => {
      if (transformedRecord[field] !== undefined && transformedRecord[field] !== null) {
        const value = String(transformedRecord[field]).toLowerCase().trim();
        if (value === 'true' || value === 'yes' || value === '1') {
          transformedRecord[field] = true;
        } else if (value === 'false' || value === 'no' || value === '0') {
          transformedRecord[field] = false;
        } else if (value === '' || value === 'n/a' || value === 'N/A') {
          transformedRecord[field] = null;
        } else {
          // For any other string value, convert to null to avoid type errors
          transformedRecord[field] = null;
        }
      }
    });

    // Convert numeric fields
    const numericFields = ['year_built1', 'floor_count', 'unit_count', 'setup_fee_property_management'];
    numericFields.forEach(field => {
      if (transformedRecord[field] !== undefined && transformedRecord[field] !== null) {
        if (transformedRecord[field] === '' || transformedRecord[field] === 'n/a' || transformedRecord[field] === 'N/A') {
          transformedRecord[field] = null;
        } else {
          const numValue = parseFloat(transformedRecord[field]);
          if (!isNaN(numValue)) {
            transformedRecord[field] = numValue;
          } else {
            transformedRecord[field] = null;
          }
        }
      }
    });

    // Convert float fields
    const floatFields = ['exchange_rate'];
    floatFields.forEach(field => {
      if (transformedRecord[field] !== undefined && transformedRecord[field] !== null) {
        if (transformedRecord[field] === '' || transformedRecord[field] === 'n/a' || transformedRecord[field] === 'N/A') {
          transformedRecord[field] = null;
        } else {
          const floatValue = parseFloat(transformedRecord[field]);
          if (!isNaN(floatValue)) {
            transformedRecord[field] = floatValue;
          } else {
            transformedRecord[field] = null;
          }
        }
      }
    });

    // Convert date fields
    const dateFields = [
      'created_time',
      'modified_time',
      'last_activity_time',
      'unsubscribed_time',
      'date_of_construction',
      'management_start_date',
      'rma_effective_date',
      'rma_expiry_date',
    ];
    dateFields.forEach(field => {
      if (transformedRecord[field] !== undefined && transformedRecord[field] !== null) {
        if (transformedRecord[field] === '' || transformedRecord[field] === 'n/a' || transformedRecord[field] === 'N/A') {
          transformedRecord[field] = null;
        } else {
          try {
            const dateValue = new Date(transformedRecord[field]);
            if (!isNaN(dateValue.getTime())) {
              transformedRecord[field] = dateValue;
            } else {
              transformedRecord[field] = null;
            }
          } catch (error) {
            transformedRecord[field] = null;
          }
        }
      }
    });

    return transformedRecord;
  }

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

      const building = await this.prisma.buildings.create({
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

  async importFromCsv(csvData: string) {
    try {
      const records = await parseCsvStringToJson(csvData);
      if (!records || records.length === 0) {
        throw new BadRequestException('No valid records found in CSV');
      }

      console.log(`Processing ${records.length} buildings records from CSV`);
      console.log('Sample record:', records[0]);

      const results = {
        total: records.length,
        successful: 0,
        failed: 0,
        errors: [] as string[],
        startTime: new Date(),
        endTime: null as Date | null,
      };

      try {
        // Transform CSV data with proper type conversions first
        const transformedCsvRecords = records.map(record => this.transformCsvData(record));

        // Process in chunks for better performance
        const CHUNK_SIZE = 100; // Process 100 records at a time
        const chunks: Record<string, any>[][] = [];

        for (let i = 0; i < transformedCsvRecords.length; i += CHUNK_SIZE) {
          chunks.push(transformedCsvRecords.slice(i, i + CHUNK_SIZE));
        }

        console.log(`Processing ${chunks.length} chunks of ${CHUNK_SIZE} records each`);

        // Process each chunk
        for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
          const chunk = chunks[chunkIndex];

          try {
            // Prepare chunk data for bulk insert
            const chunkData = chunk.map(record => {
              const { created_at, updated_at, ...buildingData } = record;
              return buildingData;
            });

            // Debug: Log the first record of each chunk for validation
            if (chunkIndex === 0) {
              console.log('\n=== Sample Chunk Data ===');
              console.log('First record:', JSON.stringify(chunkData[0], null, 2));
            }

            // Bulk insert the chunk
            const createdBuildings = await this.prisma.buildings.createMany({
              data: chunkData as any,
              skipDuplicates: true, // Skip duplicates based on unique constraints
            });

            results.successful += createdBuildings.count;
            console.log(`✓ Chunk ${chunkIndex + 1}: Successfully created ${createdBuildings.count} buildings`);
          } catch (error) {
            // Log the error and continue with next chunk instead of falling back to individual inserts
            console.error(`✗ Chunk ${chunkIndex + 1}: Bulk insert failed:`, error.message);

            // Add chunk error to results
            results.failed += chunk.length;
            const errorMessage = `Chunk ${chunkIndex + 1}: ${error.message}`;
            results.errors.push(errorMessage);

            // Continue with next chunk instead of individual inserts
            console.log(`Skipping chunk ${chunkIndex + 1} and continuing with next chunk...`);
          }
        }

        results.endTime = new Date();
        const duration = results.endTime.getTime() - results.startTime.getTime();

        console.log('\n=== Building CSV Import Summary ===');
        console.log(`Total records: ${results.total}`);
        console.log(`Successful: ${results.successful}`);
        console.log(`Failed: ${results.failed}`);
        console.log(`Duration: ${duration}ms`);
        console.log(`Average: ${(duration / results.total).toFixed(2)}ms per record`);

        if (results.errors.length > 0) {
          console.log('\nErrors:');
          results.errors.forEach(error => console.log(`- ${error}`));
        }

        // After successful building import, update property types
        console.log('\n=== Updating Property Types ===');
        let propertyUpdateResults = {
          total_properties: 0,
          updated: 0,
          skipped: 0,
          errors: 0
        };

        try {
          // Get all properties that have associated_building using raw SQL
          const propertiesWithBuilding = await this.prisma.$queryRaw<Array<{id: string, associated_building: any}>>`
            SELECT id, associated_building 
            FROM properties 
            WHERE associated_building IS NOT NULL
          `;

          console.log(`Found ${propertiesWithBuilding.length} properties with associated buildings`);

          for (const property of propertiesWithBuilding) {
            try {
              // Extract building ID from associated_building
              let buildingId: string | null = null;
              
              if (property.associated_building && typeof property.associated_building === 'object') {
                const ab = property.associated_building as any;
                if (ab && ab.id && typeof ab.id === 'string') {
                  buildingId = ab.id;
                }
              }

              if (!buildingId) {
                console.log(`Skipping property ${property.id}: No valid building ID found`);
                propertyUpdateResults.skipped++;
                continue;
              }

              // Find the building with matching building_property_id
              const building = await this.prisma.buildings.findFirst({
                where: {
                  building_property_id: buildingId
                },
                select: {
                  property_type: true
                }
              });

              if (!building || !building.property_type) {
                console.log(`Skipping property ${property.id}: No building found or no property_type`);
                propertyUpdateResults.skipped++;
                continue;
              }

              // Update the property with the building's property_type using raw SQL
              await this.prisma.$executeRaw`
                UPDATE properties 
                SET property_type = ${building.property_type}, updated_at = NOW()
                WHERE id = ${property.id}
              `;

              console.log(`Updated property ${property.id} with property_type: ${building.property_type}`);
              propertyUpdateResults.updated++;

            } catch (error) {
              console.error(`Error updating property ${property.id}:`, error.message);
              propertyUpdateResults.errors++;
            }
          }

          propertyUpdateResults.total_properties = propertiesWithBuilding.length;
          console.log('Property type update completed:', propertyUpdateResults);

        } catch (error) {
          console.error('Failed to update property types:', error);
          propertyUpdateResults.errors++;
        }

        return {
          statusCode: 200,
          message: 'Building CSV import completed with property type updates',
          data: {
            ...results,
            property_updates: propertyUpdateResults
          },
        };
      } catch (error) {
        console.error('Error during building CSV import:', error);
        throw new InternalServerErrorException('Error processing building CSV data');
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        console.error('Building CSV import error:', error);
        throw new InternalServerErrorException('Error importing building CSV data');
      }
    }
  }
}
