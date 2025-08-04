import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { ALLOWED_PROPERTY_TYPES } from '../constants/property-types';
import { parseCsvStringToJson } from '../../../../shared/utils/csv';
import { CreatePropertyDto } from '../dto/create-property.dto';
import { RentalPreferencesDto } from '../dto/rental-preferences.dto';
import { getDistance } from 'geolib';
import { GetPropertiesSummaryDto } from '../dto/get-properties-summary.dto';
import { SimilarPropertiesDto } from '../dto/similar-properties.dto';
import { ListPropertyDto } from '../dto/list-property.dto';
import { GetListedPropertiesDto } from '../dto/get-listed-properties.dto';
import { UpdateListedPropertyDto } from '../dto/update-listed-property.dto';
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
    'marketed_price',
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
    try {
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
    } catch (error) {
      console.error('Failed to transform Zoho to Prisma data:', error.stack);
      throw new InternalServerErrorException('Something Went Wrong');
    }
  }

  /**
   * Transform CSV data with proper type conversions for bulk import
   * This method handles CSV-specific data type conversions without affecting the existing create API
   */
  private transformCsvData(csvRecord: Record<string, any>) {
    try {
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
      const numericFields = ['total_area_sq_ft', 'number_of_floors', 'marketed_price'];

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
    } catch (error) {
      console.error('Failed to transform CSV data:', error.stack);
      throw new InternalServerErrorException('Something Went Wrong');
    }
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
        success: true,
        message: 'Property created successfully',
        data: {
          property,
          property_details: propertyDetails,
        },
      };
    } catch (error) {
      console.error('Failed to create property:', error.stack);
      throw new InternalServerErrorException('Something Went Wrong');
    }
  }

  async saveOrClearRentalPreferences(tenant_id: string, rentalPreferencesDto: RentalPreferencesDto & { clear?: boolean }) {
    try {
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
      const { price_min, price_max, bedrooms, bathrooms, parking, property_type, move_in_date } = rentalPreferencesDto;

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
    } catch (error) {
      console.error('Failed to save or clear rental preferences:', error.stack);
      throw new InternalServerErrorException('Something Went Wrong');
    }
  }

  async getRentalPreferences(tenant_id: string) {
    try {
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
    } catch (error) {
      console.error('Failed to get rental preferences:', error.stack);
      throw new InternalServerErrorException('Something Went Wrong');
    }
  }

  async getAllPropertiesSummary(query: GetPropertiesSummaryDto) {
    try {
      const {
        tenant_id,
        page_number = '1',
        page_size = '10',
        search,
        bedrooms,
        bathrooms,
        parking,
        min_price,
        max_price,
        property_type,
        move_in_date,
        latitude,
        longitude,
        radius,
      } = query;

      let where: any = {};

      // Handle rental preference filtering
      if (tenant_id) {
        const rentalPref = await this.prisma.rental_preference.findUnique({
          where: { tenant_id },
        });

        if (rentalPref) {
          const moveInDateFilter = rentalPref.move_in_date
            ? {
                property_details: {
                  earliest_move_in_date: {
                    gte: new Date(new Date(rentalPref.move_in_date).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                    lte: new Date(new Date(rentalPref.move_in_date).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                  },
                },
              }
            : {};

          where = {
            ...(rentalPref.bedrooms && { bedrooms: { gte: rentalPref.bedrooms } }),
            ...(rentalPref.bathrooms && { bathrooms: { gte: rentalPref.bathrooms } }),
            ...(rentalPref.property_type && { property_type: rentalPref.property_type }),
            ...(rentalPref.parking && {
              property_details: {
                number_of_parking_spaces: { gte: rentalPref.parking },
              },
            }),
            ...(rentalPref.price_min || rentalPref.price_max
              ? {
                  marketed_price: {
                    ...(rentalPref.price_min && { gte: Number(rentalPref.price_min) }),
                    ...(rentalPref.price_max && { lte: Number(rentalPref.price_max) }),
                  },
                }
              : {}),
            ...moveInDateFilter,
          };
        }
      } else {
        if (bedrooms) where.bedrooms = { gte: bedrooms.toString() };
        if (bathrooms) where.bathrooms = { gte: bathrooms.toString() };
        if (search) where.name = { contains: search, mode: 'insensitive' };
        if (property_type) where.property_type = property_type;
        if (parking) {
          where.property_details = {
            ...(where.property_details || {}),
            number_of_parking_spaces: { gte: Number(parking) },
          };
        }
        if (min_price || max_price) {
          where.marketed_price = {};
          if (min_price) where.marketed_price.gte = Number(min_price);
          if (max_price) where.marketed_price.lte = Number(max_price);
        }
        if (move_in_date) {
          const moveIn = new Date(move_in_date);
          const moveInPlus7 = new Date(moveIn);
          moveInPlus7.setDate(moveIn.getDate() + 7);

          where.property_details = {
            ...(where.property_details || {}),
            earliest_move_in_date: {
              gte: moveIn.toISOString(),
              lte: moveInPlus7.toISOString(),
            },
          };
        }
      }

      // Calculate new property threshold
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      let allProperties = await this.prisma.properties.findMany({
        where,
        select: {
          id: true,
          name: true,
          bedrooms: true,
          bathrooms: true,
          updated_at: true,
          latitude: true,
          longitude: true,
          marketed_price: true,
          thumbnail_image: true,
          property_details: {
            select: {
              number_of_parking_spaces: true,
            },
          },
        },
      });

      // Mark liked & new
      const likedIds = tenant_id
        ? new Set(
            (
              await this.prisma.liked.findUnique({
                where: { tenant_id },
                select: { property_ids: true },
              })
            )?.property_ids || []
          )
        : new Set();

      // Get tour scheduling details for the tenant if tenant_id is provided
      let tourScheduledDetails = new Map();
      if (tenant_id) {
        const tourScheduled = await this.prisma.tour_scheduled.findMany({
          where: { 
            tenant_id,
            property_id: { in: allProperties.map(p => p.id) } // Only get tours for properties in the result
          },
          select: {
            id: true,
            property_id: true,
            agent_id: true,
            move_in_date: true,
            status: true,
            created_at: true,
            updated_at: true,
          },
        });
        
        // Create a map for quick lookup
        tourScheduled.forEach(tour => {
          tourScheduledDetails.set(tour.property_id, tour);
        });
      }

      let dataWithLiked = allProperties.map(prop => {
        const tourScheduled = tenant_id ? tourScheduledDetails.get(prop.id) : null;
        
        return {
          ...prop,
          liked: tenant_id ? likedIds.has(prop.id) : undefined,
          is_new_property: new Date(prop.updated_at) >= lastWeek,
          tour_scheduled: tourScheduled, // Only return tour details if tenant has booked for this property
        };
      });

      // Geo filter
      if (latitude && longitude && radius) {
        const lat = Number(latitude);
        const lon = Number(longitude);
        const rad = Number(radius);

        dataWithLiked = dataWithLiked.filter(prop => {
          if (prop.latitude && prop.longitude) {
            const distance = getDistance({ latitude: lat, longitude: lon }, { latitude: Number(prop.latitude), longitude: Number(prop.longitude) });
            return distance <= rad * 1000;
          }
          return false;
        });
      }

      const total_count = dataWithLiked.length;

      // Manual pagination after filtering
      const paginated = dataWithLiked.slice((Number(page_number) - 1) * Number(page_size), Number(page_number) * Number(page_size));

      return {
        statusCode: 200,
        success: true,
        message: 'Properties fetched successfully',
        data: paginated,
        total_count,
        page_number,
        page_size,
      };
    } catch (error) {
      console.error('Failed to get all properties summary:', error.stack);
      throw new InternalServerErrorException('Something Went Wrong');
    }
  }

  async getPropertyById(property_id: string, tenant_id?: string) {
    try {
      const property = await this.prisma.properties.findUnique({
        where: { id: property_id },
        select: {
          id: true,
          name: true,
          thumbnail_image: true,
          property_type: true,
          property_attachments: true,
          bedrooms: true,
          bathrooms: true,
          property_condition: true,
          basement_details: true,
          basement_included: true,
          total_area_sq_ft: true,
          number_of_floors: true,
          fireplace: true,
          window_coverings: true,
          flooring_common_area: true,
          ceiling_hight: true,
          bedroom_layout: true,
          closets: true,
          en_suite_bathrooms: true,
          fireplace_bedroom: true,
          den_can_be_used_as_a_bedroom: true,
          shower_type: true,
          upgraded_bathrooms: true,
          countertops_bathroom: true,
          central_hvac: true,
          heating_ac_unit: true,
          heated_floors: true,
          washer_dryer: true,
          furnace: true,
          hot_water_heater_manufacturer: true,
          washer_and_dryer: true,
          air_conditioning_manufacturer: true,
          countertops: true,
          dishwasher: true,
          upgraded_kitchen: true,
          appliance_finishes: true,
          new_ice_maker: true,
          upgraded_back_splash: true,
          refrigerator_manufacture: true,
          stove_oven: true,
          dishwasher_manufacture: true,
          microwave_manufacture: true,
          cooktop_manufacture: true,
          ventilation_hood_manufacture: true,
          latitude: true,
          longitude: true,
          associated_building: true,
          marketed_price: true,
          property_details: {
            select: {
              owner: true,
              earliest_move_in_date: true,
              hot_water_tank_provider: true,
              refrigerator_manufacture: true,
              microwave_manufacture: true,
              unit_category: true,
              meta_description: true,
              lawn_and_snow_care: true,
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
            province: true,
            country: true,
            postal_code: true,
            category: true,
            date_of_construction: true,
            corporation_number: true,
            concierge_building_management_info: true,
            keyless_entry: true,
            enter_phone_system: true,
            onsite_staff: true,
            elevators: true,
            security_onsite: true,
            concierge_service: true,
            has_bicycle_storage: true,
            wheelchair_access: true,
            has_guest_suites: true,
            laundry_facilities: true,
            pet_spa: true,
            outdoor_patio: true,
            has_rooftop_patio: true,
            outdoor_child_play_area: true,
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
            has_meeting_room: true,
            has_yoga_room: true,
            rec_room: true,
            has_game_room: true,
            has_party_room: true,
            library: true,
            has_movie_theater: true,
            has_billiards_room: true,
            has_whirlpool: true,
            has_steam_room: true,
            has_sauna: true,
            has_basketball_court: true,
            has_pool: true,
            has_ventilation_hood: true,
            piano_lounge: true,
            has_bowling_alley: true,
            indoor_child_play_area: true,
            has_golf_range: true,
            gym: true,
            barbecue_area: true,
          },
        });
      }
      // Count IMAGE and VIDEO attachments
      let imageCount = 0;
      let videoCount = 0;
      
      if (property.property_attachments && Array.isArray(property.property_attachments)) {
        property.property_attachments.forEach((attachment: any) => {
          if (attachment.type === 'IMAGE') {
            imageCount++;
          } else if (attachment.type === 'VIDEO') {
            videoCount++;
          }
        });
      }

      // Transform owner data with additional fields
      let transformedProperty = { ...property };
      if (transformedProperty.property_details?.owner && typeof transformedProperty.property_details.owner === 'object') {
        transformedProperty.property_details.owner = {
          ...transformedProperty.property_details.owner,
          type: "Property Owner",
          name: "Mark A.",
          owner_image: "https://d2b67d11lk2106.cloudfront.net/tenants/tenant_d93247c8-7f58-4ca7-82dd-8a0c8241c2bf/documents/Government_id/1754043622854_image 81.png",
          verified: true
        };
      }

      // Get tour scheduling details for the tenant if tenant_id is provided
      let tourScheduled: any = null;
      if (tenant_id) {
        const tourResult = await this.prisma.tour_scheduled.findFirst({
          where: { 
            tenant_id,
            property_id: property_id
          },
          select: {
            id: true,
            property_id: true,
            agent_id: true,
            move_in_date: true,
            status: true,
            created_at: true,
            updated_at: true,
          },
        });
        tourScheduled = tourResult;
      }

      return {
        statusCode: 200,
        success: true,
        message: 'Property fetched successfully',
        data: { 
          ...transformedProperty, 
          liked, 
          building,
          attachment_counts: {
            images: imageCount,
            videos: videoCount
          },
          tour_scheduled: tourScheduled // Only return tour details if tenant has booked for this property
        },
      };
    } catch (error) {
      console.error('Failed to get property by ID:', error.stack);
      throw new InternalServerErrorException('Something Went Wrong');
    }
  }
  async importFromCsv(csvData: string) {
    try {
      const records = await parseCsvStringToJson(csvData);
      if (!records || records.length === 0) {
        throw new BadRequestException('No valid records found in CSV');
      }

      console.log(`Processing ${records.length} records from CSV`);

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

              // Ensure marketed_price is a number or null
              if (validatedData.marketed_price !== null && validatedData.marketed_price !== undefined) {
                if (typeof validatedData.marketed_price === 'string') {
                  const value = validatedData.marketed_price.trim();
                  if (value && value !== 'n/a' && value !== 'N/A' && value !== '') {
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue)) {
                      validatedData.marketed_price = Math.round(numValue); // Convert to integer
                    } else {
                      validatedData.marketed_price = null;
                    }
                  } else {
                    validatedData.marketed_price = null;
                  }
                } else if (typeof validatedData.marketed_price === 'number') {
                  validatedData.marketed_price = Math.round(validatedData.marketed_price); // Ensure it's an integer
                } else {
                  validatedData.marketed_price = null;
                }
              }

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

  async getSimilarProperties(query: SimilarPropertiesDto) {
    try {
      const { property_id, limit = '10', radius_km = '5' } = query;
      const limitNum = Number(limit);
      const radiusKm = Number(radius_km);

      // Get the reference property
      const referenceProperty = await this.prisma.properties.findUnique({
        where: { id: property_id },
        select: {
          id: true,
          name: true,
          property_type: true,
          marketed_price: true,
          total_area_sq_ft: true,
          bedrooms: true,
          bathrooms: true,
          latitude: true,
          longitude: true,
          city: true,
          address: true,
          thumbnail_image: true,
          property_details: {
            select: {
              number_of_parking_spaces: true,
            },
          },
        },
      });
      if (!referenceProperty) {
        return {
          statusCode: 404,
          success: false,
          message: 'Reference property not found',
          data: null,
        };
      }

      // Get all other properties for comparison
      const allProperties = await this.prisma.properties.findMany({
        where: {
          id: { not: property_id }, // Exclude the reference property
        },
        select: {
          id: true,
          name: true,
          property_type: true,
          marketed_price: true,
          total_area_sq_ft: true,
          bedrooms: true,
          bathrooms: true,
          latitude: true,
          longitude: true,
          city: true,
          address: true,
          thumbnail_image: true,
          property_details: {
            select: {
              number_of_parking_spaces: true,
            },
          },
        },
      });

      // Calculate similarity scores for each property
      const propertiesWithScores = allProperties
        .map(property => {
          const score = this.calculateSimilarityScore(referenceProperty, property, radiusKm);
          return { ...property, similarity_score: score };
        })
        .filter(property => property.similarity_score > 0) // Only include properties with some similarity
        .sort((a, b) => b.similarity_score - a.similarity_score) // Sort by similarity score descending
        .slice(0, limitNum); // Limit results

      return {
        statusCode: 200,
        success: true,
        message: 'Similar properties found successfully',
        data: {
          reference_property: referenceProperty,
          similar_properties: propertiesWithScores,
          total_found: propertiesWithScores.length,
          search_criteria: {
            radius_km: radiusKm,
            limit: limitNum,
          },
        },
      };
    } catch (error) {
      console.error('Failed to get similar properties:', error.stack);
      throw new InternalServerErrorException('Something Went Wrong');
    }
  }

  private calculateSimilarityScore(
    reference: any,
    property: any,
    radiusKm: number
  ): number {
    let totalScore = 0;
    let maxPossibleScore = 0;

    // 1. Location Score (40% weight)
    const locationScore = this.calculateLocationScore(reference, property, radiusKm);
    totalScore += locationScore * 0.4;
    maxPossibleScore += 100 * 0.4;

    // 2. Price Score (20% weight)
    const priceScore = this.calculatePriceScore(reference, property);
    totalScore += priceScore * 0.2;
    maxPossibleScore += 100 * 0.2;

    // 3. Size Score (15% weight)
    const sizeScore = this.calculateSizeScore(reference, property);
    totalScore += sizeScore * 0.15;
    maxPossibleScore += 100 * 0.15;

    // 4. Property Type Score (15% weight)
    const typeScore = this.calculatePropertyTypeScore(reference, property);
    totalScore += typeScore * 0.15;
    maxPossibleScore += 100 * 0.15;

    // 5. Amenities Score (10% weight)
    const amenitiesScore = this.calculateAmenitiesScore(reference, property);
    totalScore += amenitiesScore * 0.1;
    maxPossibleScore += 100 * 0.1;

    // Return normalized score (0-100)
    return maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
  }

  private calculateLocationScore(reference: any, property: any, radiusKm: number): number {
    if (!reference.latitude || !reference.longitude || !property.latitude || !property.longitude) {
      return 0;
    }

    const distance = getDistance(
      { latitude: Number(reference.latitude), longitude: Number(reference.longitude) },
      { latitude: Number(property.latitude), longitude: Number(property.longitude) }
    );

    const distanceKm = distance / 1000; // Convert meters to kilometers

    if (distanceKm <= radiusKm) {
      // Within radius: score decreases linearly from 100 to 50
      return Math.max(50, 100 - (distanceKm / radiusKm) * 50);
    } else {
      // Outside radius: score decreases exponentially
      return Math.max(0, 50 * Math.exp(-(distanceKm - radiusKm) / radiusKm));
    }
  }

  private calculatePriceScore(reference: any, property: any): number {
    if (!reference.marketed_price || !property.marketed_price) {
      return 0;
    }

    const priceDiff = Math.abs(reference.marketed_price - property.marketed_price);
    const priceRatio = priceDiff / reference.marketed_price;

    if (priceRatio <= 0.1) return 100; // Within 10%
    if (priceRatio <= 0.2) return 80;  // Within 20%
    if (priceRatio <= 0.3) return 60;  // Within 30%
    if (priceRatio <= 0.5) return 40;  // Within 50%
    return Math.max(0, 20 * (1 - priceRatio)); // Beyond 50%
  }

  private calculateSizeScore(reference: any, property: any): number {
    if (!reference.total_area_sq_ft || !property.total_area_sq_ft) {
      return 0;
    }

    const sizeDiff = Math.abs(reference.total_area_sq_ft - property.total_area_sq_ft);
    const sizeRatio = sizeDiff / reference.total_area_sq_ft;

    if (sizeRatio <= 0.1) return 100; // Within 10%
    if (sizeRatio <= 0.2) return 80;  // Within 20%
    if (sizeRatio <= 0.3) return 60;  // Within 30%
    if (sizeRatio <= 0.5) return 40;  // Within 50%
    return Math.max(0, 20 * (1 - sizeRatio)); // Beyond 50%
  }

  private calculatePropertyTypeScore(reference: any, property: any): number {
    if (!reference.property_type || !property.property_type) {
      return 50; // Neutral score if type is missing
    }

    return reference.property_type === property.property_type ? 100 : 0;
  }

  private calculateAmenitiesScore(reference: any, property: any): number {
    let score = 0;
    let totalComparisons = 0;

    // Compare bedrooms
    if (reference.bedrooms && property.bedrooms) {
      const bedroomDiff = Math.abs(Number(reference.bedrooms) - Number(property.bedrooms));
      score += bedroomDiff === 0 ? 100 : Math.max(0, 100 - bedroomDiff * 25);
      totalComparisons++;
    }

    // Compare bathrooms
    if (reference.bathrooms && property.bathrooms) {
      const bathroomDiff = Math.abs(Number(reference.bathrooms) - Number(property.bathrooms));
      score += bathroomDiff === 0 ? 100 : Math.max(0, 100 - bathroomDiff * 25);
      totalComparisons++;
    }

    // Compare parking spaces
    const refParking = reference.property_details?.number_of_parking_spaces || 0;
    const propParking = property.property_details?.number_of_parking_spaces || 0;
    if (refParking > 0 || propParking > 0) {
      const parkingDiff = Math.abs(refParking - propParking);
      score += parkingDiff === 0 ? 100 : Math.max(0, 100 - parkingDiff * 25);
      totalComparisons++;
    }

    return totalComparisons > 0 ? score / totalComparisons : 50;
  }

  private async generateUniqueBuildingPropertyId(): Promise<string> {
    let buildingPropertyId: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      // Generate a unique building_property_id with format: BUILDING-{timestamp}-{random}
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      buildingPropertyId = `BUILDING-${timestamp}-${random}`;

      // Check if this ID already exists
      const existingBuilding = await this.prisma.buildings.findFirst({
        where: { building_property_id: buildingPropertyId },
      });

      if (!existingBuilding) {
        isUnique = true;
      } else {
        attempts++;
        // Wait a bit before trying again to ensure different timestamp
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }

    if (!isUnique) {
      throw new Error('Unable to generate unique building_property_id after multiple attempts');
    }

    return buildingPropertyId!;
  }

  async listProperty(listPropertyDto: ListPropertyDto, tenant_id?: string) {
    try {
      // Extract data for each table
      const propertyData = {
        zcrm_id: listPropertyDto.zcrm_id,
        available_date: listPropertyDto.available_date ? new Date(listPropertyDto.available_date) : null,
        property_condition: listPropertyDto.property_condition,
        basement_details: listPropertyDto.basement_details,
        basement_included: listPropertyDto.basement_included,
        total_area_sq_ft: listPropertyDto.total_area_sq_ft,
        number_of_floors: listPropertyDto.number_of_floors,
        property_type: listPropertyDto.property_type,
        name: listPropertyDto.name,
        city: listPropertyDto.city,
        address: listPropertyDto.address,
        marketed_price: listPropertyDto.marketed_price,
        fireplace: listPropertyDto.fireplace,
        window_coverings: listPropertyDto.window_coverings,
        flooring_common_area: listPropertyDto.flooring_common_area,
        ceiling_hight: listPropertyDto.ceiling_hight,
        bedrooms: listPropertyDto.bedrooms,
        bedroom_layout: listPropertyDto.bedroom_layout,
        closets: listPropertyDto.closets,
        en_suite_bathrooms: listPropertyDto.en_suite_bathrooms,
        fireplace_bedroom: listPropertyDto.fireplace_bedroom,
        den_can_be_used_as_a_bedroom: listPropertyDto.den_can_be_used_as_a_bedroom,
        bathrooms: listPropertyDto.bathrooms,
        shower_type: listPropertyDto.shower_type,
        upgraded_bathrooms: listPropertyDto.upgraded_bathrooms,
        countertops_bathroom: listPropertyDto.countertops_bathroom,
        central_hvac: listPropertyDto.central_hvac ? new Date(listPropertyDto.central_hvac) : null,
        heating_ac_unit: listPropertyDto.heating_ac_unit,
        heated_floors: listPropertyDto.heated_floors,
        washer_dryer: listPropertyDto.washer_dryer,
        furnace: listPropertyDto.furnace,
        hot_water_heater_manufacturer: listPropertyDto.hot_water_heater_manufacturer,
        washer_and_dryer: listPropertyDto.washer_and_dryer,
        air_conditioning_manufacturer: listPropertyDto.air_conditioning_manufacturer,
        countertops: listPropertyDto.countertops,
        dishwasher: listPropertyDto.dishwasher,
        upgraded_kitchen: listPropertyDto.upgraded_kitchen,
        appliance_finishes: listPropertyDto.appliance_finishes,
        new_ice_maker: listPropertyDto.new_ice_maker,
        upgraded_back_splash: listPropertyDto.upgraded_back_splash,
        thumbnail_image: listPropertyDto.thumbnail_image,
        refrigerator_manufacture: listPropertyDto.refrigerator_manufacture,
        stove_oven: listPropertyDto.stove_oven,
        dishwasher_manufacture: listPropertyDto.dishwasher_manufacture,
        microwave_manufacture: listPropertyDto.microwave_manufacture,
        cooktop_manufacture: listPropertyDto.cooktop_manufacture,
        ventilation_hood_manufacture: listPropertyDto.ventilation_hood_manufacture,
        dryer_manufacture: listPropertyDto.dryer_manufacture,
        latitude: listPropertyDto.latitude,
        longitude: listPropertyDto.longitude,
        washer_dryer_in_unit: listPropertyDto.washer_dryer_in_unit,
        tenant_id: listPropertyDto.tenant_id || tenant_id,
      };

      // Extract property details data
      const propertyDetailsData = {
        owner: listPropertyDto.owner,
        tenant_prospect_marketed_price_multiplied: listPropertyDto.tenant_prospect_marketed_price_multiplied,
        daily_rent: listPropertyDto.daily_rent,
        currency: listPropertyDto.currency,
        setup_fee: listPropertyDto.setup_fee,
        management_fees: listPropertyDto.management_fees,
        link_to_automatically_book_showing: listPropertyDto.link_to_automatically_book_showing,
        important_information_for_booking_showing: listPropertyDto.important_information_for_booking_showing,
        outdoor_pool: listPropertyDto.outdoor_pool,
        unit_owner_deal: listPropertyDto.unit_owner_deal,
        huge_private_terrace: listPropertyDto.huge_private_terrace,
        heat_inclusion: listPropertyDto.heat_inclusion,
        carbon_monoxide_detector: listPropertyDto.carbon_monoxide_detector,
        internet_inclusion: listPropertyDto.internet_inclusion,
        private_garage: listPropertyDto.private_garage,
        tons_of_natural_light: listPropertyDto.tons_of_natural_light,
        central_vaccum: listPropertyDto.central_vaccum,
        ac_inclusion: listPropertyDto.ac_inclusion,
        corner_unit: listPropertyDto.corner_unit,
        walk_in_closets: listPropertyDto.walk_in_closets,
        phone_inclusion: listPropertyDto.phone_inclusion,
        client_support_specialist: listPropertyDto.client_support_specialist,
        noe_contact: listPropertyDto.noe_contact,
        email: listPropertyDto.email,
        postal_code: listPropertyDto.postal_code,
        neighbourhood: listPropertyDto.neighbourhood,
        view: listPropertyDto.view,
        management_start_date: listPropertyDto.management_start_date ? new Date(listPropertyDto.management_start_date) : null,
        management_end_date: listPropertyDto.management_end_date ? new Date(listPropertyDto.management_end_date) : null,
        management_deal_created: listPropertyDto.management_deal_created,
        date_under_management: listPropertyDto.date_under_management ? new Date(listPropertyDto.date_under_management) : null,
        ad_description_with_parking_and_locker: listPropertyDto.ad_description_with_parking_and_locker,
        posting_title_with_parking_and_locker: listPropertyDto.posting_title_with_parking_and_locker,
        email_description: listPropertyDto.email_description,
        social_media_description: listPropertyDto.social_media_description,
        meta_description: listPropertyDto.meta_description,
        linkedin: listPropertyDto.linkedin,
        google_my_business: listPropertyDto.google_my_business,
        instagram: listPropertyDto.instagram,
        youtube_video: listPropertyDto.youtube_video,
        unit_type: listPropertyDto.unit_type,
        unit_category: listPropertyDto.unit_category,
        appliances: listPropertyDto.appliances,
        flooring_in_bedrooms: listPropertyDto.flooring_in_bedrooms,
        storage_details: listPropertyDto.storage_details,
        parking_details: listPropertyDto.parking_details,
        locker_level_and_number: listPropertyDto.locker_level_and_number,
        backyard: listPropertyDto.backyard,
        is_the_backyard_fenced: listPropertyDto.is_the_backyard_fenced,
        gas_provider: listPropertyDto.gas_provider,
        furnace_filter: listPropertyDto.furnace_filter,
        hot_water_tank_provider: listPropertyDto.hot_water_tank_provider,
        washer_manufacture: listPropertyDto.washer_manufacture,
        refrigerator_manufacture: listPropertyDto.refrigerator_manufacture,
        smoke_alarm_1: listPropertyDto.smoke_alarm_1,
        fire_extinguisher1: listPropertyDto.fire_extinguisher1,
        insurance_policy_number: listPropertyDto.insurance_policy_number,
        insurance_home_owner: listPropertyDto.insurance_home_owner,
        create_legal_file: listPropertyDto.create_legal_file,
        max_occupants: listPropertyDto.max_occupants,
        synced_web_tp: listPropertyDto.synced_web_tp,
        point2homes: listPropertyDto.point2homes,
        fully_marketed: listPropertyDto.fully_marketed,
        publish_to_rypm_website: listPropertyDto.publish_to_rypm_website,
        website_verified: listPropertyDto.website_verified,
        unsubscribed_mode: listPropertyDto.unsubscribed_mode,
        active_1_10_days: listPropertyDto.active_1_10_days,
        update_portfolio: listPropertyDto.update_portfolio,
        kijiji_data_importer: listPropertyDto.kijiji_data_importer,
        tenant_cons_email_last_sent: listPropertyDto.tenant_cons_email_last_sent ? new Date(listPropertyDto.tenant_cons_email_last_sent) : null,
        noe_vacancy_date: listPropertyDto.noe_vacancy_date ? new Date(listPropertyDto.noe_vacancy_date) : null,
        noe_date_and_time_from_owner_portal: listPropertyDto.noe_date_and_time_from_owner_portal ? new Date(listPropertyDto.noe_date_and_time_from_owner_portal) : null,
        closing_date: listPropertyDto.closing_date ? new Date(listPropertyDto.closing_date) : null,
        when_was_the_property_leased: listPropertyDto.when_was_the_property_leased ? new Date(listPropertyDto.when_was_the_property_leased) : null,
        scheduled_photos_and_video: listPropertyDto.scheduled_photos_and_video,
        flushing_of_drain_work_order: listPropertyDto.flushing_of_drain_work_order,
        modified_time: listPropertyDto.modified_time,
        last_activity_time: listPropertyDto.last_activity_time ? new Date(listPropertyDto.last_activity_time) : null,
        communication: listPropertyDto.communication,
        tp_response: listPropertyDto.tp_response,
        create_task_temporary: listPropertyDto.create_task_temporary,
        task_temporary_2: listPropertyDto.task_temporary_2,
        creator_record_id: listPropertyDto.creator_record_id,
        territory: listPropertyDto.territory,
        exchange_rate: listPropertyDto.exchange_rate,
        modified_by: listPropertyDto.modified_by,
        unit_url: listPropertyDto.unit_url,
      };

      // Extract building data
      const buildingData = {
        building_id: listPropertyDto.building_id,
        building_property_id: listPropertyDto.building_property_id || await this.generateUniqueBuildingPropertyId(),
        name: listPropertyDto.name,
        address: listPropertyDto.address,
        city: listPropertyDto.city,
        province: listPropertyDto.province,
        country: listPropertyDto.country,
        postal_code: listPropertyDto.postal_code,
        latitude: listPropertyDto.latitude,
        longitude: listPropertyDto.longitude,
        property_type: listPropertyDto.property_type,
        category: listPropertyDto.category,
        year_built1: listPropertyDto.year_built1,
        date_of_construction: listPropertyDto.date_of_construction ? new Date(listPropertyDto.date_of_construction) : null,
        floor_count: listPropertyDto.floor_count,
        unit_count: listPropertyDto.unit_count,
        unit_name: listPropertyDto.unit_name,
        office_phone_number: listPropertyDto.office_phone_number,
        office_address: listPropertyDto.office_address,
        property_management_contact_email: listPropertyDto.property_management_contact_email,
        owner: listPropertyDto.owner,
        created_by: listPropertyDto.created_by,
        modified_by: listPropertyDto.modified_by,
        territory: listPropertyDto.territory,
        territory_id: listPropertyDto.territory_id,
        territory_search_result: listPropertyDto.territory_search_result,
        currency: listPropertyDto.currency,
        exchange_rate: listPropertyDto.exchange_rate,
        setup_fee_property_management: listPropertyDto.setup_fee_property_management,
        flat_fee_utilities: listPropertyDto.flat_fee_utilities,
        elevators: listPropertyDto.elevators,
        parking_garage: listPropertyDto.parking_garage,
        remote_garage: listPropertyDto.remote_garage,
        visitor_parking: listPropertyDto.visitor_parking,
        electric_car_charging_stations: listPropertyDto.electric_car_charging_stations,
        wheelchair_access: listPropertyDto.wheelchair_access,
        keyless_entry: listPropertyDto.keyless_entry,
        security_onsite: listPropertyDto.security_onsite,
        onsite_staff: listPropertyDto.onsite_staff,
        laundry_facilities: listPropertyDto.laundry_facilities,
        rec_room: listPropertyDto.rec_room,
        day_care_centre: listPropertyDto.day_care_centre,
        indoor_child_play_area: listPropertyDto.indoor_child_play_area,
        outdoor_child_play_area: listPropertyDto.outdoor_child_play_area,
        library: listPropertyDto.library,
        piano_lounge: listPropertyDto.piano_lounge,
        concierge_building_management_info: listPropertyDto.concierge_building_management_info,
        has_golf_range: listPropertyDto.has_golf_range,
        has_tennis_court: listPropertyDto.has_tennis_court,
        has_basketball_court: listPropertyDto.has_basketball_court,
        has_squash_court: listPropertyDto.has_squash_court,
        has_bowling_alley: listPropertyDto.has_bowling_alley,
        has_movie_theater: listPropertyDto.has_movie_theater,
        has_billiards_room: listPropertyDto.has_billiards_room,
        has_yoga_room: listPropertyDto.has_yoga_room,
        has_whirlpool: listPropertyDto.has_whirlpool,
        has_steam_room: listPropertyDto.has_steam_room,
        has_sauna: listPropertyDto.has_sauna,
        has_pool: listPropertyDto.has_pool,
        has_outdoor_pool: listPropertyDto.has_outdoor_pool,
        pet_spa: listPropertyDto.pet_spa,
        has_fitness_center: listPropertyDto.has_fitness_center,
        has_meeting_room: listPropertyDto.has_meeting_room,
        has_ventilation_hood: listPropertyDto.has_ventilation_hood,
        outdoor_patio: listPropertyDto.outdoor_patio,
        has_cabana: listPropertyDto.has_cabana,
        has_rooftop_patio: listPropertyDto.has_rooftop_patio,
        has_party_room: listPropertyDto.has_party_room,
        has_bbq_terrace: listPropertyDto.has_bbq_terrace,
        has_lobby_lounge: listPropertyDto.has_lobby_lounge,
        has_guest_suites: listPropertyDto.has_guest_suites,
        has_business_centre: listPropertyDto.has_business_centre,
        has_game_room: listPropertyDto.has_game_room,
        has_bicycle_storage: listPropertyDto.has_bicycle_storage,
        car_wash: listPropertyDto.car_wash,
        heat_included1: listPropertyDto.heat_included1,
        ac_included1: listPropertyDto.ac_included1,
        internet_included: listPropertyDto.internet_included,
        cable_included: listPropertyDto.cable_included,
        water_filtration_softener_rental: listPropertyDto.water_filtration_softener_rental,
        hot_water_tank_provider: listPropertyDto.hot_water_tank_provider,
        gas_provider: listPropertyDto.gas_provider,
        hydro_provider: listPropertyDto.hydro_provider,
        water_provider: listPropertyDto.water_provider,
        utility_notes: listPropertyDto.utility_notes,
      };

      // Create or update building first (if building data is provided)
      let building: any = null;
      if (buildingData.building_property_id) {
        // Check if building exists with this building_property_id
        const existingBuilding = await this.prisma.buildings.findFirst({
          where: { building_property_id: buildingData.building_property_id },
        });
        
        if (existingBuilding) {
          // Update existing building
          building = await this.prisma.buildings.update({
            where: { id: existingBuilding.id },
            data: buildingData,
          });
        } else {
          // Create new building
          building = await this.prisma.buildings.create({
            data: buildingData,
          });
        }
      }

      // Create property with building association
      const propertyDataWithBuilding = {
        ...propertyData,
        associated_building: building && building.building_property_id ? { id: building.building_property_id } : null,
      };

      const property = await this.prisma.properties.create({
        data: propertyDataWithBuilding as any,
      });

      // Create property details
      const propertyDetails = await this.prisma.property_details.create({
        data: {
          property_id: property.id,
          ...propertyDetailsData,
        },
      });

      return {
        statusCode: 200,
        success: true,
        message: 'Property listed successfully',
        data: {
          property,
          property_details: propertyDetails,
          building,
        },
      };
    } catch (error) {
      console.error('Failed to list property:', error.stack);
      throw new InternalServerErrorException('Something Went Wrong');
    }
  }

  async getAllListedProperties(query: GetListedPropertiesDto) {
    try {
      const pageNumber = Number(query.page_number);
      const pageSize = Number(query.page_size);
      const skip = (pageNumber - 1) * pageSize;

      // Build where clause
      const whereClause: any = {};
      
      if (query.tenant_id) {
        whereClause.tenant_id = query.tenant_id;
      }
      
      if (query.property_type) {
        whereClause.property_type = query.property_type;
      }
      
      if (query.city) {
        whereClause.city = query.city;
      }

      // Get properties with pagination
      const properties = await this.prisma.properties.findMany({
        where: whereClause,
        select: {
          id: true,
        },
        skip,
        take: pageSize,
        orderBy: {
          created_at: 'desc',
        },
      });

      // Get total count
      const totalCount = await this.prisma.properties.count({
        where: whereClause,
      });

      return {
        statusCode: 200,
        success: true,
        message: 'Listed properties retrieved successfully',
        data: {
          property_ids: properties.map(p => p.id),
          pagination: {
            page_number: pageNumber,
            page_size: pageSize,
            total_count: totalCount,
            total_pages: Math.ceil(totalCount / pageSize),
          },
        },
      };
    } catch (error) {
      console.error('Failed to get listed properties:', error.stack);
      throw new InternalServerErrorException('Something Went Wrong');
    }
  }

  async updateListedProperty(updatePropertyDto: UpdateListedPropertyDto, tenant_id?: string) {
    try {
      const { property_id, ...updateData } = updatePropertyDto;

      // Check if property exists and belongs to the tenant
      const existingProperty = await this.prisma.properties.findFirst({
        where: {
          id: property_id,
          tenant_id: tenant_id,
        },
      });

      if (!existingProperty) {
        return {
          statusCode: 404,
          success: false,
          message: 'Property not found or access denied',
          data: null,
        };
      }

      // Extract data for each table
      const propertyData = {
        zcrm_id: updateData.zcrm_id,
        available_date: updateData.available_date ? new Date(updateData.available_date) : null,
        property_condition: updateData.property_condition,
        basement_details: updateData.basement_details,
        basement_included: updateData.basement_included,
        total_area_sq_ft: updateData.total_area_sq_ft,
        number_of_floors: updateData.number_of_floors,
        property_type: updateData.property_type,
        name: updateData.name,
        city: updateData.city,
        address: updateData.address,
        marketed_price: updateData.marketed_price,
        fireplace: updateData.fireplace,
        window_coverings: updateData.window_coverings,
        flooring_common_area: updateData.flooring_common_area,
        ceiling_hight: updateData.ceiling_hight,
        bedrooms: updateData.bedrooms,
        bedroom_layout: updateData.bedroom_layout,
        closets: updateData.closets,
        en_suite_bathrooms: updateData.en_suite_bathrooms,
        fireplace_bedroom: updateData.fireplace_bedroom,
        den_can_be_used_as_a_bedroom: updateData.den_can_be_used_as_a_bedroom,
        bathrooms: updateData.bathrooms,
        shower_type: updateData.shower_type,
        upgraded_bathrooms: updateData.upgraded_bathrooms,
        countertops_bathroom: updateData.countertops_bathroom,
        central_hvac: updateData.central_hvac ? new Date(updateData.central_hvac) : null,
        heating_ac_unit: updateData.heating_ac_unit,
        heated_floors: updateData.heated_floors,
        washer_dryer: updateData.washer_dryer,
        furnace: updateData.furnace,
        hot_water_heater_manufacturer: updateData.hot_water_heater_manufacturer,
        washer_and_dryer: updateData.washer_and_dryer,
        air_conditioning_manufacturer: updateData.air_conditioning_manufacturer,
        countertops: updateData.countertops,
        dishwasher: updateData.dishwasher,
        upgraded_kitchen: updateData.upgraded_kitchen,
        appliance_finishes: updateData.appliance_finishes,
        new_ice_maker: updateData.new_ice_maker,
        upgraded_back_splash: updateData.upgraded_back_splash,
        thumbnail_image: updateData.thumbnail_image,
        refrigerator_manufacture: updateData.refrigerator_manufacture,
        stove_oven: updateData.stove_oven,
        dishwasher_manufacture: updateData.dishwasher_manufacture,
        microwave_manufacture: updateData.microwave_manufacture,
        cooktop_manufacture: updateData.cooktop_manufacture,
        ventilation_hood_manufacture: updateData.ventilation_hood_manufacture,
        dryer_manufacture: updateData.dryer_manufacture,
        latitude: updateData.latitude,
        longitude: updateData.longitude,
        washer_dryer_in_unit: updateData.washer_dryer_in_unit,
      };

      // Extract property details data
      const propertyDetailsData = {
        owner: updateData.owner,
        tenant_prospect_marketed_price_multiplied: updateData.tenant_prospect_marketed_price_multiplied,
        daily_rent: updateData.daily_rent,
        currency: updateData.currency,
        setup_fee: updateData.setup_fee,
        management_fees: updateData.management_fees,
        link_to_automatically_book_showing: updateData.link_to_automatically_book_showing,
        important_information_for_booking_showing: updateData.important_information_for_booking_showing,
        outdoor_pool: updateData.outdoor_pool,
        unit_owner_deal: updateData.unit_owner_deal,
        huge_private_terrace: updateData.huge_private_terrace,
        heat_inclusion: updateData.heat_inclusion,
        carbon_monoxide_detector: updateData.carbon_monoxide_detector,
        internet_inclusion: updateData.internet_inclusion,
        private_garage: updateData.private_garage,
        tons_of_natural_light: updateData.tons_of_natural_light,
        central_vaccum: updateData.central_vaccum,
        ac_inclusion: updateData.ac_inclusion,
        corner_unit: updateData.corner_unit,
        walk_in_closets: updateData.walk_in_closets,
        phone_inclusion: updateData.phone_inclusion,
        client_support_specialist: updateData.client_support_specialist,
        noe_contact: updateData.noe_contact,
        email: updateData.email,
        postal_code: updateData.postal_code,
        neighbourhood: updateData.neighbourhood,
        view: updateData.view,
        management_start_date: updateData.management_start_date ? new Date(updateData.management_start_date) : null,
        management_end_date: updateData.management_end_date ? new Date(updateData.management_end_date) : null,
        management_deal_created: updateData.management_deal_created,
        date_under_management: updateData.date_under_management ? new Date(updateData.date_under_management) : null,
        ad_description_with_parking_and_locker: updateData.ad_description_with_parking_and_locker,
        posting_title_with_parking_and_locker: updateData.posting_title_with_parking_and_locker,
        email_description: updateData.email_description,
        social_media_description: updateData.social_media_description,
        meta_description: updateData.meta_description,
        linkedin: updateData.linkedin,
        google_my_business: updateData.google_my_business,
        instagram: updateData.instagram,
        youtube_video: updateData.youtube_video,
        unit_type: updateData.unit_type,
        unit_category: updateData.unit_category,
        appliances: updateData.appliances,
        flooring_in_bedrooms: updateData.flooring_in_bedrooms,
        storage_details: updateData.storage_details,
        parking_details: updateData.parking_details,
        locker_level_and_number: updateData.locker_level_and_number,
        backyard: updateData.backyard,
        is_the_backyard_fenced: updateData.is_the_backyard_fenced,
        gas_provider: updateData.gas_provider,
        furnace_filter: updateData.furnace_filter,
        hot_water_tank_provider: updateData.hot_water_tank_provider,
        washer_manufacture: updateData.washer_manufacture,
        refrigerator_manufacture: updateData.refrigerator_manufacture,
        smoke_alarm_1: updateData.smoke_alarm_1,
        fire_extinguisher1: updateData.fire_extinguisher1,
        insurance_policy_number: updateData.insurance_policy_number,
        insurance_home_owner: updateData.insurance_home_owner,
        create_legal_file: updateData.create_legal_file,
        max_occupants: updateData.max_occupants,
        synced_web_tp: updateData.synced_web_tp,
        point2homes: updateData.point2homes,
        fully_marketed: updateData.fully_marketed,
        publish_to_rypm_website: updateData.publish_to_rypm_website,
        website_verified: updateData.website_verified,
        unsubscribed_mode: updateData.unsubscribed_mode,
        active_1_10_days: updateData.active_1_10_days,
        update_portfolio: updateData.update_portfolio,
        kijiji_data_importer: updateData.kijiji_data_importer,
        tenant_cons_email_last_sent: updateData.tenant_cons_email_last_sent ? new Date(updateData.tenant_cons_email_last_sent) : null,
        noe_vacancy_date: updateData.noe_vacancy_date ? new Date(updateData.noe_vacancy_date) : null,
        noe_date_and_time_from_owner_portal: updateData.noe_date_and_time_from_owner_portal ? new Date(updateData.noe_date_and_time_from_owner_portal) : null,
        closing_date: updateData.closing_date ? new Date(updateData.closing_date) : null,
        when_was_the_property_leased: updateData.when_was_the_property_leased ? new Date(updateData.when_was_the_property_leased) : null,
        scheduled_photos_and_video: updateData.scheduled_photos_and_video,
        flushing_of_drain_work_order: updateData.flushing_of_drain_work_order,
        modified_time: updateData.modified_time,
        last_activity_time: updateData.last_activity_time ? new Date(updateData.last_activity_time) : null,
        communication: updateData.communication,
        tp_response: updateData.tp_response,
        create_task_temporary: updateData.create_task_temporary,
        task_temporary_2: updateData.task_temporary_2,
        creator_record_id: updateData.creator_record_id,
        territory: updateData.territory,
        exchange_rate: updateData.exchange_rate,
        modified_by: updateData.modified_by,
        unit_url: updateData.unit_url,
      };

      // Extract building data
      const buildingData = {
        building_id: updateData.building_id,
        building_property_id: updateData.building_property_id || await this.generateUniqueBuildingPropertyId(),
        name: updateData.name,
        address: updateData.address,
        city: updateData.city,
        province: updateData.province,
        country: updateData.country,
        postal_code: updateData.postal_code,
        latitude: updateData.latitude,
        longitude: updateData.longitude,
        property_type: updateData.property_type,
        category: updateData.category,
        year_built1: updateData.year_built1,
        date_of_construction: updateData.date_of_construction ? new Date(updateData.date_of_construction) : null,
        floor_count: updateData.floor_count,
        unit_count: updateData.unit_count,
        unit_name: updateData.unit_name,
        office_phone_number: updateData.office_phone_number,
        office_address: updateData.office_address,
        property_management_contact_email: updateData.property_management_contact_email,
        owner: updateData.owner,
        created_by: updateData.created_by,
        modified_by: updateData.modified_by,
        territory: updateData.territory,
        territory_id: updateData.territory_id,
        territory_search_result: updateData.territory_search_result,
        currency: updateData.currency,
        exchange_rate: updateData.exchange_rate,
        setup_fee_property_management: updateData.setup_fee_property_management,
        flat_fee_utilities: updateData.flat_fee_utilities,
        elevators: updateData.elevators,
        parking_garage: updateData.parking_garage,
        remote_garage: updateData.remote_garage,
        visitor_parking: updateData.visitor_parking,
        electric_car_charging_stations: updateData.electric_car_charging_stations,
        wheelchair_access: updateData.wheelchair_access,
        keyless_entry: updateData.keyless_entry,
        security_onsite: updateData.security_onsite,
        onsite_staff: updateData.onsite_staff,
        laundry_facilities: updateData.laundry_facilities,
        rec_room: updateData.rec_room,
        day_care_centre: updateData.day_care_centre,
        indoor_child_play_area: updateData.indoor_child_play_area,
        outdoor_child_play_area: updateData.outdoor_child_play_area,
        library: updateData.library,
        piano_lounge: updateData.piano_lounge,
        concierge_building_management_info: updateData.concierge_building_management_info,
        has_golf_range: updateData.has_golf_range,
        has_tennis_court: updateData.has_tennis_court,
        has_basketball_court: updateData.has_basketball_court,
        has_squash_court: updateData.has_squash_court,
        has_bowling_alley: updateData.has_bowling_alley,
        has_movie_theater: updateData.has_movie_theater,
        has_billiards_room: updateData.has_billiards_room,
        has_yoga_room: updateData.has_yoga_room,
        has_whirlpool: updateData.has_whirlpool,
        has_steam_room: updateData.has_steam_room,
        has_sauna: updateData.has_sauna,
        has_pool: updateData.has_pool,
        has_outdoor_pool: updateData.has_outdoor_pool,
        pet_spa: updateData.pet_spa,
        has_fitness_center: updateData.has_fitness_center,
        has_meeting_room: updateData.has_meeting_room,
        has_ventilation_hood: updateData.has_ventilation_hood,
        outdoor_patio: updateData.outdoor_patio,
        has_cabana: updateData.has_cabana,
        has_rooftop_patio: updateData.has_rooftop_patio,
        has_party_room: updateData.has_party_room,
        has_bbq_terrace: updateData.has_bbq_terrace,
        has_lobby_lounge: updateData.has_lobby_lounge,
        has_guest_suites: updateData.has_guest_suites,
        has_business_centre: updateData.has_business_centre,
        has_game_room: updateData.has_game_room,
        has_bicycle_storage: updateData.has_bicycle_storage,
        car_wash: updateData.car_wash,
        heat_included1: updateData.heat_included1,
        ac_included1: updateData.ac_included1,
        internet_included: updateData.internet_included,
        cable_included: updateData.cable_included,
        water_filtration_softener_rental: updateData.water_filtration_softener_rental,
        hot_water_tank_provider: updateData.hot_water_tank_provider,
        gas_provider: updateData.gas_provider,
        hydro_provider: updateData.hydro_provider,
        water_provider: updateData.water_provider,
        utility_notes: updateData.utility_notes,
      };

      // Update or create building if building data is provided
      let building: any = null;
      if (buildingData.building_property_id) {
        const existingBuilding = await this.prisma.buildings.findFirst({
          where: { building_property_id: buildingData.building_property_id },
        });
        
        if (existingBuilding) {
          building = await this.prisma.buildings.update({
            where: { id: existingBuilding.id },
            data: buildingData,
          });
        } else {
          building = await this.prisma.buildings.create({
            data: buildingData,
          });
        }
      }

      // Update property
      const propertyDataWithBuilding = {
        ...propertyData,
        associated_building: building && building.building_property_id ? { id: building.building_property_id } : null,
      };

      const property = await this.prisma.properties.update({
        where: { id: property_id },
        data: propertyDataWithBuilding as any,
      });

      // Update property details
      const propertyDetails = await this.prisma.property_details.update({
        where: { property_id },
        data: propertyDetailsData,
      });

      return {
        statusCode: 200,
        success: true,
        message: 'Property updated successfully',
        data: {
          property,
          property_details: propertyDetails,
          building,
        },
      };
    } catch (error) {
      console.error('Failed to update property:', error.stack);
      throw new InternalServerErrorException('Something Went Wrong');
    }
  }
}
