import { paginateArray } from '@/shared/utils/response';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { ALLOWED_PROPERTY_TYPES } from '../constants/property-types';
import { parseCsvStringToJson } from '../../../../shared/utils/csv';
import { CreatePropertyDto } from '../dto/create-property.dto';
import { RentalPreferencesDto } from '../dto/rental-preferences.dto';
export type PropertyType = (typeof ALLOWED_PROPERTY_TYPES)[number];

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  // Fields that appear in Unit Features screen (go to property table)
  private static readonly propertyFields = new Set([
    'zcrm_id',
    'available_date',
    'property_condition',
    'basement_details',
    'basement_included',
    'total_area_sq_ft',
    'number_of_floors',
    'fireplace',
    'window_coverings',
    'flooring_common_area',
    'ceiling_hight',
    'bedrooms',
    'bedroom_layout',
    'closets',
    'en_suite_bathrooms',
    'fireplace_bedroom',
    'den_can_be_used_as_a_bedroom',
    'bathrooms',
    'shower_type',
    'upgraded_bathrooms',
    'countertops_bathroom',
    'central_hvac',
    'heating_ac_unit',
    'heated_floors',
    'washer_dryer',
    'furnace',
    'hot_water_heater_manufacturer',
    'washer_and_dryer',
    'air_conditioning_manufacturer',
    'countertops',
    'dishwasher',
    'upgraded_kitchen',
    'appliance_finishes',
    'new_ice_maker',
    'upgraded_back_splash',
    'refrigerator_manufacture',
    'stove_oven',
    'dishwasher_manufacture',
    'microwave_manufacture',
    'cooktop_manufacture',
    'ventilation_hood_manufacture',
    'dryer_manufacture',
    'washer_dryer_in_unit',
    'name',
    'latitude',
    'longitude',
    'city',
    'associated_building',
    'address',
  ]);

  // Mapping from Zoho keys to Prisma property model fields
  private static readonly zohoToPrismaMap: Record<string, string> = {
    Owner: 'owner',
    Tenant_Prospect_Marketed_Price_Multiplied: 'tenant_prospect_marketed_price_multiplied',
    Link_to_automatically_book_showing: 'link_to_automatically_book_showing',
    Outdoor_Pool: 'outdoor_pool',
    Unit_Owner_Deal: 'unit_owner_deal',
    Huge_Private_Terrace: 'huge_private_terrace',
    Dishwasher_Manufacture: 'dishwasher_manufacture',
    Heat_Inclusion: 'heat_inclusion',
    Carbon_Monoxide_Detector: 'carbon_monoxide_detector',
    Client_Support_Specialist: 'client_support_specialist',
    Internet_Inclusion: 'internet_inclusion',
    Currency: 'currency',
    Daily_Rent: 'daily_rent',
    Postal_Code: 'postal_code',
    Synced_Web_TP: 'synced_web_tp',
    Point2Homes: 'point2homes',
    Dishwasher: 'dishwasher',
    parking_level_num: 'parking_level_num',
    Countertops_Bathroom: 'countertops_bathroom',
    Create_Legal_File: 'create_legal_file',
    Unit_Type: 'unit_type',
    Tenant_cons_email_last_sent: 'tenant_cons_email_last_sent',
    NOE_Contact: 'noe_contact',
    Area_Search_Result: 'area_search_result',
    Furnace: 'furnace',
    Management_End_Date: 'management_end_date',
    locker_level_and_number: 'locker_level_and_number',
    Setup_Fee_Property_Management: 'setup_fee_property_management',
    TP_Response: 'tp_response',
    LinkedIn: 'linkedin',
    Ad_Description_With_Parking_and_Locker: 'ad_description_with_parking_and_locker',
    Google_My_Business: 'google_my_business',
    NOE_Vacancy_Date: 'noe_vacancy_date',
    Create_task_temporary: 'create_task_temporary',
    Management_Start_Date: 'management_start_date',
    latitude: 'latitude',
    Email_Description: 'email_description',
    Heated_Floors: 'heated_floors',
    En_Suite_Bathrooms: 'en_suite_bathrooms',
    Task_temporary_2: 'task_temporary_2',
    Fully_Marketed: 'fully_marketed',
    Unit_URL: 'unit_url',
    Posting_Title_With_Parking_and_Locker: 'posting_title_with_parking_and_locker',
    Storage_Details: 'storage_details',
    Publish_to_RYPM_Website: 'publish_to_rypm_website',
    Communication: 'communication',
    Air_Conditioning_Manufacturer: 'air_conditioning_manufacturer',
    Basement_Included: 'basement_included',
    Private_Garage: 'private_garage',
    Tons_of_Natural_Light: 'tons_of_natural_light',
    Smoke_Alarm_1: 'smoke_alarm_1',
    Window_Coverings: 'window_coverings',
    Central_Vaccum: 'central_vaccum',
    Cooktop_Manufacture: 'cooktop_manufacture',
    Insurance_Policy_Number: 'insurance_policy_number',
    Upgraded_Bathrooms: 'upgraded_bathrooms',
    AC_Inclusion: 'ac_inclusion',
    Important_Information_for_booking_showing: 'important_information_for_booking_showing',
    Property_is_Leased_Lost_Legal_Department_Revie: 'property_is_leased_lost_legal_department_revie',
    Management_Deal_created: 'management_deal_created',
    Unit_Category: 'unit_category',
    Appliances: 'appliances',
    Flooring_in_Bedrooms: 'flooring_in_bedrooms',
    Creator_Record_Id: 'creator_record_id',
    Is_the_backyard_fenced: 'is_the_backyard_fenced',
    Corner_Unit: 'corner_unit',
    Email: 'email',
    Closets: 'closets',
    Name: 'name',
    Last_Activity_Time: 'last_activity_time',
    Website_Verified: 'website_verified',
    Unsubscribed_Mode: 'unsubscribed_mode',
    Exchange_Rate: 'exchange_rate',
    Backyard: 'backyard',
    Gas_Provider: 'gas_provider',
    Furnace_Filter: 'furnace_filter',
    Max_Occupants: 'max_occupants',
    Flooring_Common_Area: 'flooring_common_area',
    When_was_the_property_leased: 'when_was_the_property_leased',
    Territory: 'territory',
    Youtube_Video: 'youtube_video',
    Year_Built: 'year_built',
    Scheduled_Photos_and_Video: 'scheduled_photos_and_video',
    Update_Portfolio: 'update_portfolio',
    Flushing_of_drain_work_order: 'flushing_of_drain_work_order',
    Walk_In_Closets: 'walk_in_closets',
    Washer_Manufacture: 'washer_manufacture',
    active_1_10_days: 'active_1_10_days',
    Fire_Extinguisher1: 'fire_extinguisher1',
    Instagram: 'instagram',
    Insurance_Home_Owner: 'insurance_home_owner',
    Phone_Inclusion: 'phone_inclusion',
    Parking_Details: 'parking_details',
    Closing_Date: 'closing_date',
    NOE_Date_and_Time_from_Owner_Portal: 'noe_date_and_time_from_owner_portal',
    Modified_By: 'modified_by',
    Setup_Fee: 'setup_fee',
    Date_Under_Management: 'date_under_management',
    Neighbourhood: 'neighbourhood',
    New_Ice_Maker: 'new_ice_maker',
    Social_Media_Description: 'social_media_description',
    Modified_Time: 'modified_time',
    Meta_Description: 'meta_description',
    Hot_Water_Tank_Provider: 'hot_water_tank_provider',
    Upgraded_Back_Splash: 'upgraded_back_splash',
    Link_to_key_release_form: 'link_to_key_release_form',
    View: 'view',
    Management_Fees: 'management_fees',
    Refrigerator_Manufacture: 'refrigerator_manufacture',
    Kijiji_Data_Importer: 'kijiji_data_importer',
    Unit_Facing: 'unit_facing',
    HVAC_Inclusion: 'hvac_inclusion',
    Associated_Building: 'associated_building',
    Associated_Portfolios: 'associated_portfolios',
    Bedroom_Layout: 'bedroom_layout',
    Incentives: 'incentives',
    Address: 'address',
    Number_of_Parking_Spaces: 'number_of_parking_spaces',
    Street_Number: 'street_number',
    Location_of_Balcony: 'location_of_balcony',
    Mail_Box_Number: 'mail_box_number',
    Garage_Door_Closer: 'garage_door_closer',
    Lift: 'lift',
    Tenant_Contact: 'tenant_contact',
    Create_Project_Manually: 'create_project_manually',
    Cable_Inclusion: 'cable_inclusion',
    Farhad_Work_Orders: 'farhad_work_orders',
    Bank_Account: 'bank_account',
    Number_of_Lockers: 'number_of_lockers',
    Window_Coverings_Common_Area: 'window_coverings_common_area',
    Active_Lease: 'active_lease',
    Aether_Lease_Check: 'aether_lease_check',
    Electricity_Inclusion: 'electricity_inclusion',
    Fireplace_Bedroom: 'fireplace_bedroom',
    Created_Time: 'created_time',
    Project_Id: 'project_id',
    Address_Line_2: 'address_line_2',
    Washer_Dryer_In_Unit: 'washer_dryer_in_unit',
    High_Floor: 'high_floor',
    Liv_rent: 'liv_rent',
    Walk_out_to_Garage: 'walk_out_to_garage',
    YouTube: 'youtube',
    Den_can_be_used_as_a_bedroom: 'den_can_be_used_as_a_bedroom',
    Upgraded_Kitchen: 'upgraded_kitchen',
    Total_Area_Sq_Ft: 'total_area_sq_ft',
    Ceiling_Hight: 'ceiling_hight',
    Dryer_Manufacture: 'dryer_manufacture',
    Bedrooms: 'bedrooms',
    Created_By: 'created_by',
    Market_Price_With_Parking_and_Locker: 'market_price_with_parking_and_locker',
    Fireplace: 'fireplace',
    Intersection: 'intersection',
    Balcony_Type: 'balcony_type',
    Save_Attachments: 'save_attachments',
    To_Be_Done_By: 'to_be_done_by',
    Washer_and_Dryer: 'washer_and_dryer',
    Guest_Parking: 'guest_parking',
    Added_to_TP: 'added_to_tp',
    Published_Rental: 'published_rental',
    How_are_utilities_split: 'how_are_utilities_split',
    Penthouse: 'penthouse',
    Tennis_Court: 'tennis_court',
    Hydro_Provider: 'hydro_provider',
    Last_Month_Rent_Deposit: 'last_month_rent_deposit',
    Hot_Water_Heater_Manufacturer: 'hot_water_heater_manufacturer',
    Marketed_Price: 'marketed_price',
    RYPM_Website: 'rypm_website',
    Property_Condition: 'property_condition',
    Microwave_Manufacture: 'microwave_manufacture',
    Locked__s: 'locked_s',
    RYPM_Website_Listing: 'rypm_website_listing',
    Tag: 'tag',
    Termination_Date: 'termination_date',
    Countertops: 'countertops',
    Party_Room: 'party_room',
    Posting_Title: 'posting_title',
    Wine_Cooler: 'wine_cooler',
    Eavestrough_and_Window_Cleaning_Estimate: 'eavestrough_and_window_cleaning_estimate',
    Notice_of_Entry_Required: 'notice_of_entry_required',
    Water_Provider: 'water_provider',
    HVAC: 'hvac',
    Basement_Details: 'basement_details',
    kijiji: 'kijiji',
    Retainer_Balance: 'retainer_balance',
    Facebook: 'facebook',
    longitude: 'longitude',
    Ventilation_Hood_Manufacture: 'ventilation_hood_manufacture',
    Date_Unpublished: 'date_unpublished',
    Duct_Cleaninga: 'duct_cleaninga',
    Media: 'media',
    Portal_ID: 'portal_id',
    City: 'city',
    Smoke_Alarm: 'smoke_alarm',
    Province: 'province',
    Ad_Description_Long: 'ad_description_long',
    Basement_Entrance: 'basement_entrance',
    Fire_Extinguisher: 'fire_extinguisher',
    Website_Badge: 'website_badge',
    Utility_Notes: 'utility_notes',
    Location_Description: 'location_description',
    Lawn_and_Snow_Care: 'lawn_and_snow_care',
    Personal_Thermostat: 'personal_thermostat',
    Furnished: 'furnished',
    Rented_out_for: 'rented_out_for',
    On_site_Laundry: 'on_site_laundry',
    Carbon_Monoxide_Detectors: 'carbon_monoxide_detectors',
    Tenant_Moving_In: 'tenant_moving_in',
    Listing_Overview_Paragraph: 'listing_overview_paragraph',
    Unit_Contact_Owner: 'unit_contact_owner',
    Leasing_Administrator: 'leasing_administrator',
    Temporary_Create_Inspection: 'temporary_create_inspection',
    Unsubscribed_Time: 'unsubscribed_time',
    Ad_Description: 'ad_description',
    Duct_Cleaning_Work_Order: 'duct_cleaning_work_order',
    Suggest_Prospects_and_Deals: 'suggest_prospects_and_deals',
    Number_of_Floors: 'number_of_floors',
    Bathrooms: 'bathrooms',
    Earliest_Move_in_Date: 'earliest_move_in_date',
    First_and_Last_Name: 'first_and_last_name',
    Wall_Oven_Manufacture: 'wall_oven_manufacture',
    Shower_Type: 'shower_type',
    Craigslist: 'craigslist',
    Stove_Oven: 'stove_oven',
    id: 'zcrm_id',
    Id: 'zcrm_id', // for csv import
  };

  private transformZohoToPrisma(zohoData: CreatePropertyDto) {
    const propertyData: Record<string, any> = {};
    const propertyDetailsData: Record<string, any> = {};
    const rawData: Record<string, any> = {};

    // Fields that should be stored as strings in the DB, but may come as booleans from Zoho
    const booleanToStringFields = new Set(['hvac_inclusion']);

    for (const [zohoKey, value] of Object.entries(zohoData)) {
      const prismaKey = PropertiesService.zohoToPrismaMap[zohoKey];

      if (prismaKey) {
        // Convert boolean to string for specific fields
        let processedValue = value;
        if (booleanToStringFields.has(prismaKey) && typeof value === 'boolean') {
          processedValue = value ? 'true' : 'false';
        } else if (
          ['owner', 'territory', 'associated_building', 'associated_portfolios', 'created_by', 'modified_by'].includes(prismaKey) &&
          value &&
          typeof value === 'string'
        ) {
          // Convert string ID to object format for CSV data
          processedValue = {
            id: value,
            name: '',
            email: '',
          };
        } else if (
          ['owner', 'territory', 'associated_building', 'associated_portfolios', 'created_by', 'modified_by'].includes(prismaKey) &&
          value &&
          typeof value === 'object'
        ) {
          processedValue = value;
        }

        // Split data between property and property_details tables
        if (PropertiesService.propertyFields.has(prismaKey)) {
          propertyData[prismaKey] = processedValue;
        } else {
          propertyDetailsData[prismaKey] = processedValue;
        }
      } else {
        rawData[zohoKey] = value;
      }
    }

    // Add raw_data to property_details
    if (Object.keys(rawData).length > 0) {
      propertyDetailsData.raw_data = rawData;
    }

    return { propertyData, propertyDetailsData };
  }

  /**
   * Transform CSV data with proper type conversions for bulk import
   * This method handles CSV-specific data type conversions without affecting the existing create API
   */
  private transformCsvData(csvRecord: Record<string, any>) {
    // First, map CSV field names to Prisma field names using the existing mapping
    const mappedRecord: Record<string, any> = {};

    for (const [csvField, value] of Object.entries(csvRecord)) {
      const prismaField = PropertiesService.zohoToPrismaMap[csvField];
      if (prismaField) {
        mappedRecord[prismaField] = value;
      } else {
        // Keep original field name if no mapping exists
        mappedRecord[csvField] = value;
      }
    }

    const transformedRecord = { ...mappedRecord };

    // Convert string booleans to actual booleans - include all boolean fields from CSV
    const booleanFields = [
      'fireplace',
      'fireplace_bedroom',
      'den_can_be_used_as_a_bedroom',
      'upgraded_bathrooms',
      'heated_floors',
      'dishwasher',
      'upgraded_kitchen',
      'washer_dryer_in_unit',
      'upgraded_back_splash',
      'new_ice_maker',
    ];

    booleanFields.forEach(field => {
      if (transformedRecord[field] !== undefined && transformedRecord[field] !== null) {
        const value = String(transformedRecord[field]).toLowerCase().trim();
        if (value === 'true' || value === 'yes' || value === '1') {
          transformedRecord[field] = true;
        } else if (value === 'false' || value === 'no' || value === '0' || value === 'no den') {
          transformedRecord[field] = false;
        } else if (value === 'n/a - basement does not exist' || value === 'n/a' || value === '') {
          transformedRecord[field] = null;
        } else {
          // For any other string value, convert to null to avoid type errors
          transformedRecord[field] = null;
        }
      }
    });

    // Convert numeric strings to numbers - only for fields that are actually Int in the schema
    const numericFields = ['total_area_sq_ft', 'number_of_floors'];

    numericFields.forEach(field => {
      if (transformedRecord[field] !== undefined && transformedRecord[field] !== null) {
        const value = String(transformedRecord[field]).trim();
        if (value && value !== 'n/a' && value !== 'N/A' && !isNaN(Number(value))) {
          transformedRecord[field] = Number(value);
        } else if (value === 'n/a' || value === 'N/A' || value === '') {
          transformedRecord[field] = null;
        }
      }
    });

    // Convert float fields to numbers
    const floatFields = ['exchange_rate'];

    floatFields.forEach(field => {
      if (transformedRecord[field] !== undefined && transformedRecord[field] !== null) {
        const value = String(transformedRecord[field]).trim();
        if (value && value !== 'n/a' && value !== 'N/A' && !isNaN(Number(value))) {
          transformedRecord[field] = Number(value);
        } else if (value === 'n/a' || value === 'N/A' || value === '') {
          transformedRecord[field] = null;
        }
      }
    });

    // Handle special cases for basement_details
    if (transformedRecord.basement_details) {
      const value = String(transformedRecord.basement_details).trim();
      if (value === 'N/A - Basement does not exist' || value === 'n/a - basement does not exist') {
        transformedRecord.basement_details = null;
      }
    }

    return transformedRecord;
  }

  async create(args: CreatePropertyDto) {
    try {
      const { propertyData, propertyDetailsData } = this.transformZohoToPrisma(args);

      // Create property first
      const property = await this.prisma.properties.create({
        data: propertyData as any,
      });

      // Create property_details with reference to property
      const propertyDetails = await this.prisma.property_details.create({
        data: {
          ...propertyDetailsData,
          property_id: property.id,
        } as any,
      });

      return {
        statusCode: 201,
        data: {
          property,
          property_details: propertyDetails,
        },
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

  async saveOrClearRentalPreferences(
    tenant_id: string,
    rentalPreferencesDto: RentalPreferencesDto & { clear?: boolean },
  ) {
    if (!tenant_id) {
      throw new BadRequestException('Unauthorized or invalid token');
    }

    // If `clear` flag is true, delete preferences
    if (rentalPreferencesDto.clear) {
      await this.prisma.rental_preference.deleteMany({
        where: { tenant_id },
      });

      return {
        statusCode: 200,
        success: true,
        message: 'Rental preferences cleared successfully',
      };
    }

    // Validate property_type
    const {
      price_min,
      price_max,
      bedrooms,
      bathrooms,
      parking,
      property_type,
      move_in_date,
    } = rentalPreferencesDto;

    if (
      property_type &&
      !ALLOWED_PROPERTY_TYPES.includes(property_type as PropertyType)
    ) {
      throw new BadRequestException(`Invalid property_type: ${property_type}`);
    }

    // Upsert rental preferences
    const upserted = await this.prisma.rental_preference.upsert({
      where: { tenant_id },
      update: {
        price_min,
        price_max,
        bedrooms,
        bathrooms,
        parking,
        property_type,
        move_in_date,
      },
      create: {
        tenant_id,
        price_min,
        price_max,
        bedrooms,
        bathrooms,
        parking,
        property_type,
        move_in_date,
      },
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Rental preferences saved successfully',
      data: upserted,
    };
  }

  async getRentalPreferences(tenant_id: string) {
    const rentalPref = await this.prisma.rental_preference.findUnique({
      where: { tenant_id },
    });
    if (!rentalPref) {
      return {
        statusCode: 200,
        success: true,
        message: 'No rental preferences found for tenant',
        data: null,
      };
    }
    return {
      statusCode: 200,
      success: true,
      message: 'Rental preferences fetched successfully',
      data: rentalPref,
    };
  }

  async getAllPropertiesSummary(
    tenant_id?: string,
    page_number = 1,
    page_size = 10,
    search?: string,
    bedrooms?: string,
    bathrooms?: string,
    parking?: string,
    min_price?: string,
    max_price?: string,
  ) {
    let where: any = {};
    if (tenant_id) {
      // Check for rental preference only if tenant_id is defined
      const rentalPref = await this.prisma.rental_preference.findUnique({
        where: { tenant_id },
      });
      if (rentalPref) {
        where = {
          bedrooms: rentalPref.bedrooms,
          bathrooms: rentalPref.bathrooms,
          property_details: {
            marketed_price: {
              gte: rentalPref.price_min,
              lte: rentalPref.price_max,
            },
            ...(rentalPref.parking && rentalPref.parking.toLowerCase() === 'yes'
              ? { number_of_parking_spaces: { gt: 0 } }
              : {}),
          },
        };
      }
    } else {
      // Only apply these filters if unauthenticated (tenant_id is not present)
      if (bedrooms) {
        where.bedrooms = bedrooms;
      }
      if (bathrooms) {
        where.bathrooms = bathrooms;
      }
      if (search) {
        where.name = { contains: search, mode: 'insensitive' };
      }
      // Parking filter: if 'yes', require at least 1 parking space
      if (parking && parking.toLowerCase() === 'yes') {
        if (!where.property_details) {
          where.property_details = {};
        }
        where.property_details.number_of_parking_spaces = { gt: 0 };
      }
      // Price range filter
      if (min_price || max_price) {
        where.property_details = { marketed_price: {} };
        if (min_price) {
          where.property_details.marketed_price.gte = Number(min_price);
        }
        if (max_price) {
          where.property_details.marketed_price.lte = Number(max_price);
        }
      }
    }

    const allProperties = await this.prisma.properties.findMany({
      where,
      select: {
        id: true,
        name: true,
        bedrooms: true,
        bathrooms: true,
        updated_at: true,
        latitude: true,
        longitude: true,
        property_details: {
          select: {
            marketed_price: true,
            number_of_parking_spaces: true  
          },
        },
      },
    });
    const paginated = paginateArray(allProperties, page_number, page_size);

    // Calculate last week's date
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    let dataWithLiked = paginated.data;
    if (tenant_id) {
      // Fetch liked property IDs for this tenant
      const liked = await this.prisma.liked.findUnique({
        where: { tenant_id },
        select: { property_ids: true },
      });
      const likedIds = liked ? new Set(liked.property_ids) : new Set();
      // Add liked: true/false and is_new_property to each property
      dataWithLiked = paginated.data.map((prop) => ({
        ...prop,
        liked: likedIds.has(prop.id),
        is_new_property: new Date(prop.updated_at) >= lastWeek,
      }));
    } else {
      // Add is_new_property to each property
      dataWithLiked = paginated.data.map((prop) => ({
        ...prop,
        is_new_property: new Date(prop.updated_at) >= lastWeek,
      }));
    }

    return {
      statusCode: 200,
      success: true,
      message: 'Properties fetched successfully',
      data: dataWithLiked,
      total_count: paginated.total_count,
      page_number: paginated.page_number,
      page_size: paginated.page_size,
    };
  }

  async getPropertyById(property_id: string, tenant_id?: string) {
    const property = await this.prisma.properties.findUnique({
      where: { id: property_id },
      select: {
        id: true,
        name: true,
        bedrooms: true,
        bathrooms: true,
        property_condition: true,
        basement_details: true,
        basement_included: true,
        total_area_sq_ft: true,
        number_of_floors: true,
        fireplace: true,
        window_coverings: true,
        ceiling_hight: true,
        shower_type: true,
        upgraded_bathrooms: true,
        countertops_bathroom: true,
        heated_floors: true,
        washer_and_dryer: true,
        countertops: true,
        dishwasher: true,
        upgraded_kitchen: true,
        new_ice_maker: true,
        upgraded_back_splash: true,
        stove_oven: true,
        cooktop_manufacture: true,
        latitude: true,
        longitude: true,
        associated_building: true,
        property_details: {
          select: {
            marketed_price: true,
            earliest_move_in_date: true,
            hot_water_tank_provider: true,
            refrigerator_manufacture: true,
            microwave_manufacture: true,
            ventilation_hood_manufacture: true,
            unit_category: true,
          },
        },
      },
    });
    if (!property) {
      return {
        statusCode: 404,
        success: false,
        message: 'Property not found',
        data: null,
      };
    }
    let liked = false;
    if (tenant_id) {
      const likedList = await this.prisma.liked.findUnique({
        where: { tenant_id },
        select: { property_ids: true },
      });
      liked = likedList ? likedList.property_ids.includes(property_id) : false;
    }
    // Fetch building info if associated_building.id exists
    let building: any = null;
    const ab = property?.associated_building;
    let buildingId: string | undefined;
    if (ab && typeof ab === 'object' && ab !== null && 'id' in ab && typeof ab.id === 'string') {
      buildingId = ab.id;
    }
    if (buildingId) {
      building = await this.prisma.buildings.findFirst({
        where: { building_property_id: buildingId },
        select: {
          address: true,
          city: true,
          country: true,
          province: true,
          postal_code: true,
          date_of_construction: true,
          concierge_building_management_info: true,
          keyless_entry: true,
          onsite_staff: true,
          elevators: true,
          security_onsite: true,
          has_bicycle_storage: true,
          wheelchair_access: true,
          has_guest_suites: true,
          laundry_facilities: true,
          pet_spa: true,
          outdoor_patio: true,
          has_rooftop_patio: true,
          indoor_child_play_area: true,
          outdoor_child_play_area: true,
          has_pool: true,
          has_outdoor_pool: true,
          has_cabana: true,
          has_tennis_court: true,
          remote_garage: true,
          visitor_parking: true,
          parking_garage: true,
          has_subway_access: true,
          public_transit: true,
          car_wash: true,
          electric_car_charging_stations: true,
        },
      });
    }
    return {
      statusCode: 200,
      success: true,
      message: 'Property fetched successfully',
      data: { ...property, liked, building },
    };

}
async importFromCsv(csvData: string) {
  try {
    const records = await parseCsvStringToJson(csvData);
    if (!records || records.length === 0) {
      throw new BadRequestException('No valid records found in CSV');
    }

    console.log(`Processing ${records.length} records from CSV`);
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

      // Split data between property and property_details tables directly
      const propertyDataArray: Record<string, any>[] = [];
      const propertyDetailsArray: Record<string, any>[] = [];

      transformedCsvRecords.forEach((record, index) => {
        const propertyData: Record<string, any> = {};
        const propertyDetailsData: Record<string, any> = {};
        const rawData: Record<string, any> = {};

        for (const [fieldName, value] of Object.entries(record)) {
          // Skip created_at and updated_at as they'll be added later
          if (fieldName === 'created_at' || fieldName === 'updated_at') {
            continue;
          }

          // Handle associated_building field - convert to JSON format
          if (fieldName === 'associated_building' && value) {
            propertyData[fieldName] = {
              id: value,
              name: '',
              email: '',
            };
            continue;
          }

          // Handle JSON fields - convert to JSON format
          const jsonFields = ['owner', 'created_by', 'modified_by', 'territory', 'associated_portfolios'];
          if (jsonFields.includes(fieldName) && value) {
            propertyDetailsData[fieldName] = {
              id: value,
              name: '',
              email: '',
            };
            continue;
          }

          // Check if field belongs to property table
          if (PropertiesService.propertyFields.has(fieldName)) {
            propertyData[fieldName] = value;
          } else {
            // Check if field is mapped in zohoToPrismaMap (goes to property_details)
            const prismaField = PropertiesService.zohoToPrismaMap[fieldName];
            if (prismaField && !PropertiesService.propertyFields.has(prismaField)) {
              propertyDetailsData[prismaField] = value;
            } else {
              // Check if field directly matches property_details schema fields
              const propertyDetailsSchemaFields = [
                'owner',
                'tenant_prospect_marketed_price_multiplied',
                'link_to_automatically_book_showing',
                'outdoor_pool',
                'unit_owner_deal',
                'huge_private_terrace',
                'heat_inclusion',
                'carbon_monoxide_detector',
                'client_support_specialist',
                'internet_inclusion',
                'currency',
                'daily_rent',
                'postal_code',
                'synced_web_tp',
                'point2homes',
                'create_legal_file',
                'unit_type',
                'tenant_cons_email_last_sent',
                'noe_contact',
                'area_search_result',
                'management_end_date',
                'locker_level_and_number',
                'setup_fee_property_management',
                'tp_response',
                'linkedin',
                'ad_description_with_parking_and_locker',
                'google_my_business',
                'noe_vacancy_date',
                'create_task_temporary',
                'management_start_date',
                'email_description',
                'task_temporary_2',
                'fully_marketed',
                'unit_url',
                'posting_title_with_parking_and_locker',
                'storage_details',
                'publish_to_rypm_website',
                'communication',
                'private_garage',
                'tons_of_natural_light',
                'smoke_alarm_1',
                'central_vaccum',
                'insurance_policy_number',
                'ac_inclusion',
                'important_information_for_booking_showing',
                'property_is_leased_lost_legal_department_revie',
                'management_deal_created',
                'unit_category',
                'appliances',
                'flooring_in_bedrooms',
                'creator_record_id',
                'is_the_backyard_fenced',
                'corner_unit',
                'email',
                'closets',
                'last_activity_time',
                'website_verified',
                'unsubscribed_mode',
                'exchange_rate',
                'backyard',
                'gas_provider',
                'furnace_filter',
                'max_occupants',
                'flooring_common_area',
                'when_was_the_property_leased',
                'territory',
                'youtube_video',
                'scheduled_photos_and_video',
                'update_portfolio',
                'flushing_of_drain_work_order',
                'walk_in_closets',
                'washer_manufacture',
                'active_1_10_days',
                'fire_extinguisher1',
                'instagram',
                'insurance_home_owner',
                'phone_inclusion',
                'parking_details',
                'closing_date',
                'noe_date_and_time_from_owner_portal',
                'modified_by',
                'setup_fee',
                'date_under_management',
                'neighbourhood',
                'new_ice_maker',
                'social_media_description',
                'modified_time',
                'meta_description',
                'hot_water_tank_provider',
                'link_to_key_release_form',
                'view',
                'management_fees',
                'refrigerator_manufacture',
                'kijiji_data_importer',
                'unit_facing',
                'hvac_inclusion',
                'associated_portfolios',
                'incentives',
                'number_of_parking_spaces',
                'street_number',
                'location_of_balcony',
                'mail_box_number',
                'garage_door_closer',
                'lift',
                'tenant_contact',
                'create_project_manually',
                'cable_inclusion',
                'farhad_work_orders',
                'bank_account',
                'number_of_lockers',
                'window_coverings_common_area',
                'active_lease',
                'aether_lease_check',
                'electricity_inclusion',
                'created_time',
                'project_id',
                'address_line_2',
                'high_floor',
                'liv_rent',
                'walk_out_to_garage',
                'youtube',
                'created_by',
                'market_price_with_parking_and_locker',
                'intersection',
                'balcony_type',
                'save_attachments',
                'to_be_done_by',
                'washer_and_dryer',
                'guest_parking',
                'added_to_tp',
                'published_rental',
                'how_are_utilities_split',
                'penthouse',
                'tennis_court',
                'hydro_provider',
                'last_month_rent_deposit',
                'marketed_price',
                'rypm_website',
                'property_condition',
                'microwave_manufacture',
                'locked_s',
                'rypm_website_listing',
                'tag',
                'termination_date',
                'party_room',
                'posting_title',
                'wine_cooler',
                'eavestrough_and_window_cleaning_estimate',
                'notice_of_entry_required',
                'water_provider',
                'hvac',
                'basement_details',
                'kijiji',
                'retainer_balance',
                'facebook',
                'ventilation_hood_manufacture',
                'date_unpublished',
                'duct_cleaninga',
                'media',
                'portal_id',
                'smoke_alarm',
                'province',
                'ad_description_long',
                'basement_entrance',
                'fire_extinguisher',
                'website_badge',
                'utility_notes',
                'location_description',
                'lawn_and_snow_care',
                'personal_thermostat',
                'furnished',
                'rented_out_for',
                'on_site_laundry',
                'carbon_monoxide_detectors',
                'tenant_moving_in',
                'listing_overview_paragraph',
                'unit_contact_owner',
                'leasing_administrator',
                'temporary_create_inspection',
                'unsubscribed_time',
                'ad_description',
                'duct_cleaning_work_order',
                'suggest_prospects_and_deals',
                'number_of_floors',
                'earliest_move_in_date',
                'first_and_last_name',
                'wall_oven_manufacture',
                'craigslist',
                'parking_level_num',
                'year_built',
              ];

              if (propertyDetailsSchemaFields.includes(fieldName)) {
                propertyDetailsData[fieldName] = value;
              } else {
                // If it's not a known field, put it in raw_data
                rawData[fieldName] = value;
              }
            }
          }
        }

        // Convert ALL boolean fields in property_details - comprehensive list from Prisma schema
        const allPropertyDetailsBooleanFields = [
          'outdoor_pool',
          'unit_owner_deal',
          'huge_private_terrace',
          'heat_inclusion',
          'carbon_monoxide_detector',
          'internet_inclusion',
          'synced_web_tp',
          'create_legal_file',
          'create_task_temporary',
          'task_temporary_2',
          'fully_marketed',
          'private_garage',
          'tons_of_natural_light',
          'central_vaccum',
          'ac_inclusion',
          'management_deal_created',
          'corner_unit',
          'update_portfolio',
          'flushing_of_drain_work_order',
          'walk_in_closets',
          'active_1_10_days',
          'phone_inclusion',
          'aether_lease_check',
          'electricity_inclusion',
          'high_floor',
          'liv_rent',
          'walk_out_to_garage',
          'save_attachments',
          'published_rental',
          'penthouse',
          'tennis_court',
          'locked_s',
          'party_room',
          'kijiji',
          'on_site_laundry',
          'carbon_monoxide_detectors',
          'temporary_create_inspection',
          'duct_cleaning_work_order',
          'kijiji_data_importer',
          'garage_door_closer',
          'lift',
          'create_project_manually',
          'cable_inclusion',
          'farhad_work_orders',
          'active_lease',
          'personal_thermostat',
          'tenant_moving_in',
          'suggest_prospects_and_deals',
          'duct_cleaninga',
          'new_ice_maker',
        ];

        allPropertyDetailsBooleanFields.forEach(field => {
          if (propertyDetailsData[field] !== undefined && propertyDetailsData[field] !== null) {
            const value = String(propertyDetailsData[field]).toLowerCase().trim();
            if (value === 'true' || value === 'yes' || value === '1') {
              propertyDetailsData[field] = true;
            } else if (value === 'false' || value === 'no' || value === '0') {
              propertyDetailsData[field] = false;
            } else if (value === 'n/a' || value === 'N/A' || value === '') {
              propertyDetailsData[field] = null;
            } else {
              // For any other string value, convert to null to avoid type errors
              propertyDetailsData[field] = null;
            }
          }
        });

        // Add raw_data to property_details if there are any unknown fields
        if (Object.keys(rawData).length > 0) {
          propertyDetailsData.raw_data = rawData;
        }

        // Debug first few records
        if (index < 3) {
          console.log(`📝 Record ${index + 1} split:`, {
            propertyFields: Object.keys(propertyData),
            propertyDetailsFields: Object.keys(propertyDetailsData),
            rawDataFields: Object.keys(rawData),
            samplePropertyData: propertyData,
            samplePropertyDetailsData: propertyDetailsData,
            sampleRawData: rawData,
            basementIncludedType: typeof propertyData.basement_included,
            basementIncludedValue: propertyData.basement_included,
          });
        }

        propertyDataArray.push(propertyData);
        propertyDetailsArray.push(propertyDetailsData);
      });

      // Filter valid property records - require zcrm_id as it's the unique identifier
      const validPropertyData = propertyDataArray.filter(p => p.zcrm_id);

      if (validPropertyData.length === 0) {
        console.log('No valid property records found - need zcrm_id');
        results.endTime = new Date();
        return {
          statusCode: 200,
          message: 'CSV import completed (no valid records)',
          data: {
            ...results,
            duration: `${results.endTime.getTime() - results.startTime.getTime()}ms`,
            recordsPerSecond: 0,
          },
        };
      }

      // Process properties in chunks for large datasets
      const chunkSize = 100;
      let totalPropertiesInserted = 0;

      for (let i = 0; i < validPropertyData.length; i += chunkSize) {
        const chunk = validPropertyData.slice(i, i + chunkSize);
        try {
          // Validate data types before inserting
          const validatedChunk = chunk.map(data => {
            const validatedData = { ...data };

            // Ensure basement_included is a string or null
            if (validatedData.basement_included !== null && validatedData.basement_included !== undefined) {
              validatedData.basement_included = String(validatedData.basement_included);
            }

            // Ensure all boolean fields are actually boolean or null
            const booleanFields = [
              'fireplace',
              'fireplace_bedroom',
              'den_can_be_used_as_a_bedroom',
              'upgraded_bathrooms',
              'heated_floors',
              'dishwasher',
              'upgraded_kitchen',
              'washer_dryer_in_unit',
              'upgraded_back_splash',
              'new_ice_maker',
            ];
            booleanFields.forEach(field => {
              if (validatedData[field] !== null && validatedData[field] !== undefined && typeof validatedData[field] !== 'boolean') {
                console.warn(`⚠️ Converting ${field} from ${typeof validatedData[field]} to null: ${validatedData[field]}`);
                validatedData[field] = null;
              }
            });

            return validatedData;
          });

          // Use createMany for properties (bulk insert in chunks)
          const propertyResult = await this.prisma.properties.createMany({
            data: validatedChunk.map(data => ({
              ...data,
              created_at: new Date(),
              updated_at: new Date(),
            })),
            skipDuplicates: true,
          });

          totalPropertiesInserted += propertyResult.count;
          console.log(`✅ Inserted ${propertyResult.count} properties in chunk ${Math.floor(i / chunkSize) + 1}`);
        } catch (insertError) {
          console.error('Property insert error for chunk:', Math.floor(i / chunkSize) + 1);
          console.error('Error details:', insertError);
          // Continue with next chunk
        }
      }

      results.successful = totalPropertiesInserted;
      console.log(`✅ Total inserted ${totalPropertiesInserted} properties using createMany in chunks`);

      const insertedPropertyIds: { id: string; zcrm_id: string | null }[] = [];

      for (let i = 0; i < validPropertyData.length; i += chunkSize) {
        const chunk = validPropertyData.slice(i, i + chunkSize);

        // Get the zcrm_ids for this chunk
        const chunkZcrmIds = chunk.map(p => p.zcrm_id).filter(Boolean);

        if (chunkZcrmIds.length > 0) {
          // Find the properties we just inserted by their zcrm_id
          const chunkInsertedProperties = await this.prisma.properties.findMany({
            where: { zcrm_id: { in: chunkZcrmIds } },
            select: { id: true, zcrm_id: true },
            orderBy: { created_at: 'desc' }, // Get the most recently created
          });

          // Map properties in the same order as the chunk
          for (const propertyData of chunk) {
            const insertedProperty = chunkInsertedProperties.find(p => p.zcrm_id === propertyData.zcrm_id);
            if (insertedProperty) {
              insertedPropertyIds.push(insertedProperty);
            }
          }
        }
      }

      // Prepare property_details data with property_id using array index
      const propertyDetailsWithIds = validPropertyData
        .map((propertyData, index) => {
          const propertyDetailsData = propertyDetailsArray[index];
          // Get the property_id from the same index in insertedPropertyIds
          const insertedProperty = insertedPropertyIds[index];

          if (!insertedProperty) {
            console.log(`⚠️ No matching property found for index ${index}:`, {
              zcrm_id: propertyData.zcrm_id,
              name: propertyData.name,
              address: propertyData.address,
              city: propertyData.city,
            });
            return null;
          }

          return {
            ...propertyDetailsData,
            property_id: insertedProperty.id,
            created_at: new Date(),
            updated_at: new Date(),
          };
        })
        .filter((data): data is Record<string, any> & { property_id: string; created_at: Date; updated_at: Date } => !!data);

      if (propertyDetailsWithIds.length > 0) {
        let totalPropertyDetailsInserted = 0;

        for (let i = 0; i < propertyDetailsWithIds.length; i += chunkSize) {
          const chunk = propertyDetailsWithIds.slice(i, i + chunkSize);

          console.log(`Processing property_details chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(propertyDetailsWithIds.length / chunkSize)}`);

          try {
            // Comprehensive type validation for ALL property_details fields
            const validatedChunk = chunk.map(data => {
              const validatedData = { ...data };

              // Define field types based on Prisma schema
              const fieldTypes = {
                // Boolean fields
                boolean: [
                  'outdoor_pool',
                  'unit_owner_deal',
                  'huge_private_terrace',
                  'heat_inclusion',
                  'carbon_monoxide_detector',
                  'internet_inclusion',
                  'synced_web_tp',
                  'create_legal_file',
                  'create_task_temporary',
                  'task_temporary_2',
                  'fully_marketed',
                  'private_garage',
                  'tons_of_natural_light',
                  'central_vaccum',
                  'ac_inclusion',
                  'management_deal_created',
                  'corner_unit',
                  'update_portfolio',
                  'flushing_of_drain_work_order',
                  'walk_in_closets',
                  'active_1_10_days',
                  'phone_inclusion',
                  'aether_lease_check',
                  'electricity_inclusion',
                  'high_floor',
                  'liv_rent',
                  'walk_out_to_garage',
                  'save_attachments',
                  'published_rental',
                  'penthouse',
                  'tennis_court',
                  'locked_s',
                  'party_room',
                  'kijiji',
                  'on_site_laundry',
                  'carbon_monoxide_detectors',
                  'temporary_create_inspection',
                  'duct_cleaning_work_order',
                  'kijiji_data_importer',
                  'garage_door_closer',
                  'lift',
                  'create_project_manually',
                  'cable_inclusion',
                  'farhad_work_orders',
                  'active_lease',
                  'personal_thermostat',
                  'tenant_moving_in',
                  'suggest_prospects_and_deals',
                  'duct_cleaninga',
                  'new_ice_maker',
                ],
                // Integer fields
                int: [
                  'tenant_prospect_marketed_price_multiplied',
                  'daily_rent',
                  'setup_fee_property_management',
                  'setup_fee',
                  'max_occupants',
                  'number_of_parking_spaces',
                  'number_of_lockers',
                  'market_price_with_parking_and_locker',
                  'marketed_price',
                  'number_of_floors',
                ],
                // Float fields
                float: ['exchange_rate', 'management_fees', 'last_month_rent_deposit', 'retainer_balance'],
                // DateTime fields
                datetime: [
                  'tenant_cons_email_last_sent',
                  'management_end_date',
                  'noe_vacancy_date',
                  'management_start_date',
                  'last_activity_time',
                  'when_was_the_property_leased',
                  'closing_date',
                  'noe_date_and_time_from_owner_portal',
                  'date_under_management',
                  'modified_time',
                  'created_time',
                  'termination_date',
                  'date_unpublished',
                  'unsubscribed_time',
                ],
                // String array fields
                stringArray: ['tag'],
                // JSON fields
                json: ['owner', 'territory', 'modified_by', 'associated_portfolios', 'created_by', 'raw_data'],
              };

              // Process each field type
              Object.entries(fieldTypes).forEach(([type, fields]) => {
                fields.forEach(field => {
                  if (validatedData[field] !== null && validatedData[field] !== undefined) {
                    switch (type) {
                      case 'boolean':
                        if (typeof validatedData[field] !== 'boolean') {
                          const value = String(validatedData[field]).toLowerCase().trim();
                          if (value === 'true' || value === 'yes' || value === '1') {
                            validatedData[field] = true;
                          } else if (value === 'false' || value === 'no' || value === '0') {
                            validatedData[field] = false;
                          } else {
                            validatedData[field] = null;
                          }
                        }
                        break;

                      case 'int':
                        if (typeof validatedData[field] !== 'number') {
                          const value = String(validatedData[field]).trim();
                          if (value && value !== 'n/a' && value !== 'N/A' && !isNaN(Number(value))) {
                            validatedData[field] = parseInt(value, 10);
                          } else {
                            validatedData[field] = null;
                          }
                        }
                        break;

                      case 'float':
                        if (typeof validatedData[field] !== 'number') {
                          const value = String(validatedData[field]).trim();
                          if (value && value !== 'n/a' && value !== 'N/A' && !isNaN(Number(value))) {
                            validatedData[field] = parseFloat(value);
                          } else {
                            validatedData[field] = null;
                          }
                        }
                        break;

                      case 'datetime':
                        if (!(validatedData[field] instanceof Date)) {
                          const value = String(validatedData[field]).trim();
                          if (value && value !== 'n/a' && value !== 'N/A' && value !== '') {
                            try {
                              const date = new Date(value);
                              if (!isNaN(date.getTime())) {
                                validatedData[field] = date;
                              } else {
                                validatedData[field] = null;
                              }
                            } catch (error) {
                              validatedData[field] = null;
                            }
                          } else {
                            validatedData[field] = null;
                          }
                        }
                        break;

                      case 'stringArray':
                        if (!Array.isArray(validatedData[field])) {
                          if (typeof validatedData[field] === 'string') {
                            const value = validatedData[field].trim();
                            if (value && value !== 'n/a' && value !== 'N/A') {
                              validatedData[field] = value
                                .split(/[,;|]/)
                                .map(item => item.trim())
                                .filter(item => item.length > 0);
                            } else {
                              validatedData[field] = [];
                            }
                          } else {
                            validatedData[field] = [];
                          }
                        }
                        break;

                      case 'json':
                        if (typeof validatedData[field] === 'string') {
                          const value = validatedData[field].trim();
                          if (value && value !== 'n/a' && value !== 'N/A') {
                            try {
                              // Try to parse as JSON first
                              validatedData[field] = JSON.parse(value);
                            } catch (error) {
                              // If not valid JSON, create a simple object with id
                              validatedData[field] = { id: value, name: '', email: '' };
                            }
                          } else {
                            validatedData[field] = null;
                          }
                        } else if (typeof validatedData[field] !== 'object' || validatedData[field] === null) {
                          validatedData[field] = null;
                        }
                        break;
                    }
                  }
                });
              });

              return validatedData;
            });

            // Use createMany for property_details (bulk insert in chunks)
            const propertyDetailsResult = await this.prisma.property_details.createMany({
              data: validatedChunk,
              skipDuplicates: true,
            });

            totalPropertyDetailsInserted += propertyDetailsResult.count;
            console.log(`✅ Inserted ${propertyDetailsResult.count} property_details in chunk ${Math.floor(i / chunkSize) + 1}`);
          } catch (insertError) {
            console.error('Property details insert error for chunk:', Math.floor(i / chunkSize) + 1);
            console.error('Error details:', insertError);
            // Continue with next chunk
          }
        }

        console.log(`✅ Total inserted ${totalPropertyDetailsInserted} property_details using createMany in chunks`);
      }

      results.endTime = new Date();
      const duration = results.endTime.getTime() - results.startTime.getTime();

      return {
        statusCode: 200,
        message: 'CSV import completed',
        data: {
          ...results,
          duration: `${duration}ms`,
          recordsPerSecond: Math.round((results.successful / (duration / 1000)) * 100) / 100,
          propertyDetailsInserted: propertyDetailsWithIds.length,
        },
      };
    } catch (error) {
      console.error('Bulk import failed:', error);
      results.failed = records.length;
      results.errors.push(`Bulk import failed: ${error.message}`);
      results.endTime = new Date();
      throw new InternalServerErrorException(`CSV import failed: ${error.message}`);
    }
  } catch (error) {
    console.error('CSV import error:', error);
    throw new InternalServerErrorException(`CSV import failed: ${error.message}`);
  }
}
}