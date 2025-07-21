// 📁 shared/enums/account-details.enum.ts

export enum HousingStatus {
  RENTING = 'Renting',
  OWNED_MORTGAGE = 'Owned_Mortgage',
  OWNED_FREE = 'Owned_Free',
  FAMILY_FRIENDS = 'Family_Friends',
  SHELTER = 'Shelter',
}

export enum SourceOfIncome {
  EMPLOYED = 'Employed',
  SELF_EMPLOYED = 'Self_Employed',
  GOVERNMENT_ASSISTANCE = 'Government_Assistance',
  STUDENT_NO_INCOME = 'Student_No_Income',
  STUDENT_SUPPORTED_BY_PARENTS = 'Student_Supported_By_Parents',
}

export enum PetType {
  DOG = 'Dog',
  CAT = 'Cat',
  BIRD = 'Bird',
  HAMSTER = 'Hamster',
  SNAKE = 'Snake',
  OTHER = 'Other',
}

export enum PetGender {
  MALE = 'Male',
  FEMALE = 'Female',
  UNKNOWN = 'Unknown',
}

// Enum for information type
export enum InformationType {
  PERSONAL_INFORMATION = 'PERSONAL_INFORMATION',
  CURRENT_RESIDENCE = 'CURRENT_RESIDENCE',
  SOURCE_OF_INCOME = 'SOURCE_OF_INCOME',
  REFERENCES = 'REFERENCES',
  EMERGENCY_CONTACT = 'EMERGENCY_CONTACT',
  VEHICLE_INFORMATION = 'VEHICLE_INFORMATION',
  PETS = 'PETS',
  BANK_DETAILS = 'BANK_DETAILS',
  DOCUMENTS = 'DOCUMENTS',
}
