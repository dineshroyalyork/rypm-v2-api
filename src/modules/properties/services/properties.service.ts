import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { CreatePropertyDto } from '../dto/create-property.dto';

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
  ]);

  // Mapping from Zoho keys to Prisma property model fields
  private static readonly zohoToPrismaMap: Record<string, string> = {
    Owner: 'owner',
    Tenant_Prospect_Marketed_Price_Multiplied:
      'tenant_prospect_marketed_price_multiplied',
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
    Ad_Description_With_Parking_and_Locker:
      'ad_description_with_parking_and_locker',
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
    Posting_Title_With_Parking_and_Locker:
      'posting_title_with_parking_and_locker',
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
    Important_Information_for_booking_showing:
      'important_information_for_booking_showing',
    Property_is_Leased_Lost_Legal_Department_Revie:
      'property_is_leased_lost_legal_department_revie',
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
    Market_Price_With_Parking_and_Locker:
      'market_price_with_parking_and_locker',
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
    Eavestrough_and_Window_Cleaning_Estimate:
      'eavestrough_and_window_cleaning_estimate',
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
        if (
          booleanToStringFields.has(prismaKey) &&
          typeof value === 'boolean'
        ) {
          processedValue = value ? 'true' : 'false';
        } else if (
          [
            'owner',
            'territory',
            'associated_building',
            'associated_portfolios',
            'created_by',
            'modified_by',
          ].includes(prismaKey) &&
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

  async create(args: CreatePropertyDto) {
    try {
      const { propertyData, propertyDetailsData } =
        this.transformZohoToPrisma(args);

      // Create property first
      const property = await this.prisma.property.create({
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
}
