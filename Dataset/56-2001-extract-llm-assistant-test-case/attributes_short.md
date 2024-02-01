# Attributes test cases with only relevant text


## Vehicle
Text: A vehicle category is a group of vehicles which have the same technical conditions laid down in an implementing regulation.

Output:
- {"name": "category", "inference": "vehicle category", "data_type": "string", "cardinality": ""}


## RoadVehicle
Text: In addition, for a road vehicle it is stated:
- the purpose for which the road vehicle is intended, which is a taxi service vehicle, a vehicle with right of way, a car rental vehicle for hire, a vehicle for general use, or a vehicle for the operation of road transport for hire by its operator,
- the manufacturer's factory mark as specified by the road vehicle manufacturer,
- the trade name if specified by the road vehicle manufacturer,
- the vehicle identification number (VIN) of the road vehicle and, if not, the chassis serial number of the road vehicle,
- type, serial number and colour of bodywork, number of seats and standing places or beds, dimensions of the loading area, volume of the box or tank,
- an the overall dimensions of the road vehicle

The municipal authority of a municipality with extended competence shall enter a road vehicle, the roadworthiness of which is subject to approval, in the register of road vehicles on the basis of a written application by the owner of the road vehicle
- the road vehicle is not listed as missing or stolen in the Schengen Information System or in the information system of the Police of the Czech Republic or this information is not established by another procedure

Output:
- {"name": "purpose", "inference": "the purpose for which the road vehicle is intended", "data_type": "string", "cardinality": ""}
- {"name": "factory mark", "inference": "the manufacturer's factory mark as specified by the road vehicle manufacturer", "data_type": "string", "cardinality": ""}
- {"name": "trade name", "inference": "the trade name if specified by the road vehicle manufacturer", "data_type": "string", "cardinality": ""}
- {"name": "vehicle identification number", "inference": "the vehicle identification number (VIN) of the road vehicle", "data_type": "string", "cardinality": ""}
- {"name": "chassis serial number", "inference": "the chassis serial number of the road vehicle", "data_type": "string", "cardinality": ""}
- {"name": "number of seats", "inference": "for a road vehicle it is stated: number of seats", "data_type": "integer", "cardinality": ""}
- {"name": "number of standing places", "inference": "for a road vehicle it is stated: number of standing places", "data_type": "integer", "cardinality": ""}
- {"name": "number of beds", "inference": "for a road vehicle it is stated: number of beds", "data_type": "integer", "cardinality": ""}
- {"name": "dimensions of loading area", "inference": "for a road vehicle it is stated: dimensions of the loading area", "data_type": "number", "cardinality": ""}
- {"name": "volume of box", "inference": "for a road vehicle it is stated: volume of the box", "data_type": "number", "cardinality": ""}
- {"name": "volume of tank", "inference": "for a road vehicle it is stated: volume of the tank", "data_type": "number", "cardinality": ""}
- {"name": "overall dimension", "inference": "the overall dimensions of the road vehicle", "data_type": "number", "cardinality": ""}
- {"name": "is not listed as missing", "inference": "the road vehicle is not listed as missing", "data_type": "boolean", "cardinality": ""}
- {"name": "is not listed as stolen", "inference": "the road vehicle is not listed as stolen", "data_type": "boolean", "cardinality": ""}


## MotorisedVehicle
Text: In addition, for a road vehicle it is stated:
- the maximum technically permissible weight, the maximum permissible weight and the maximum permissible operating weight of the road motor vehicle and the maximum technically permissible weight per axle and the maximum permissible weight per axle,
- the type of coupling device, the maximum technically permissible mass of the trailer, the maximum permissible mass of the trailer, the maximum technically permissible mass of the combination and the maximum permissible mass of the combination

Output:
- {"name": "maximum technically permissible weight", "inference": "the maximum technically permissible weight of the road motor vehicle", "data_type": "number", "cardinality": ""}
- {"name": "maximum permissible weight", "inference": "the maximum permissible weight of the road motor vehicle", "data_type": "number", "cardinality": ""}
- {"name": "maximum permissible operating weight", "inference": "the maximum permissible operating weight of the road motor vehicle", "data_type": "number", "cardinality": ""}
- {"name": "maximum technically permissible weight per axle", "inference": "of the road motor vehicle and the maximum technically permissible weight per axle", "data_type": "number", "cardinality": ""}
- {"name": "maximum permissible weight per axle", "inference": "of the road motor vehicle and the maximum permissible weight per axle", "data_type": "number", "cardinality": ""}
- {"name": "type of coupling device", "inference": "the type of coupling device", "data_type": "number", "cardinality": ""}
- {"name": "maximum technically permissible mass of the trailer", "inference": "the maximum technically permissible mass of the trailer", "data_type": "number", "cardinality": ""}
- {"name": "maximum permissible mass of the trailer", "inference": "the maximum permissible mass of the trailer", "data_type": "number", "cardinality": ""}
- {"name": "maximum technically permissible mass of the combination", "inference": "the maximum technically permissible mass of the combination", "data_type": "number", "cardinality": ""}
- {"name": "maximum permissible mass of the combination", "inference": "the maximum permissible mass of the combination", "data_type": "number", "cardinality": ""}


## NaturalPerson
Text: The following information on the owner and operator, if different from the owner, of a road vehicle shall be entered in the register of road vehicles.
- if the person is a natural person, his name, or, where applicable, first and last names, the address of his permanent residence, long-term residence, temporary residence of at least 6 months or other authorised residence and his birth number, if any, and, where applicable, his date of birth shall be entered.

Output:
- {"name": "full name", "inference": "If the person is a natural person, his name", "data_type": "string", "cardinality": ""}
- {"name": "first name", "inference": "If the person is a natural person, where applicable, first names", "data_type": "string", "cardinality": "0..*"}
- {"name": "last name", "inference": "If the person is a natural person, where applicable, last names", "data_type": "string", "cardinality": "0..*"}
- {"name": "birth number", "inference": "If the person is a natural person, his birth number", "data_type": "integer", "cardinality": "0..1"}
- {"name": "birth date", "inference": "If the person is a natural person, his date of birth shall be entered", "data_type": "string", "cardinality": "0..1"}


## BusinessNaturalPerson
Text: The following information on the owner and operator, if different from the owner, of a road vehicle shall be entered in the register of road vehicles.
- if the person is a natural person engaged in business, then the business name or first and last names, if any, and, where appropriate, a distinguishing supplement, the address of permanent residence, long-term residence, temporary residence of at least 6 months or other authorised residence, the address of the registered office and the personal identification number, if any.

Output:
- {"name": "business name", "inference": "if the person is a natural person engaged in business, then the business name", "data_type": "string", "cardinality": "0..1"}
- {"name": "first name", "inference": "if the person is a natural person engaged in business, then business name or first name", "data_type": "string", "cardinality": "0..*"}
- {"name": "last name", "inference": "if the person is a natural person engaged in business, then business name or last name", "data_type": "string", "cardinality": "0..*"}
- {"name": "distinguishing name supplement", "inference": "if the person is a natural person engaged in business, where appropriate, a distinguishing supplement", "data_type": "string", "cardinality": "0..1"}
- {"name": "personal identification number", "inference": "if the person is a natural person engaged in business, where appropriate, the personal identification number", "data_type": "string", "cardinality": "0..1"}


## LegalPerson
Text: The following information on the owner and operator, if different from the owner, of a road vehicle shall be entered in the register of road vehicles.
- If it is a legal person or a branch thereof, then the business name or name, the address of the registered office or the location of the branch and the personal identification number, if any, shall be indicated.

Output:
- {"name": "business name", "inference": "If it is a legal person, then the business name or name shall be indicated", "data_type": "string", "cardinality": "0..1"}
- {"name": "name", "inference": "If it is a legal person, then the business name or name shall be indicated", "data_type": "string", "cardinality": "0..1"}
- {"name": "personal identification number", "inference": "If it is a legal person the personal identification number shall be indicated", "data_type": "string", "cardinality": "0..1"}


## LegalPersonBranch
Text: The following information on the owner and operator, if different from the owner, of a road vehicle shall be entered in the register of road vehicles.
- If it is a legal person or a branch thereof, then the business name or name, the address of the registered office or the location of the branch and the personal identification number, if any, shall be indicated.

Output:
- {"name": "business name", "inference": "If it is a legal person or a branch thereof, then the business name or name shall be indicated", "data_type": "string", "cardinality": "0..1"}
- {"name": "name", "inference": "If it is a legal person or a branch thereof, then the business name or name shall be indicated", "data_type": "string", "cardinality": "0..1"}


## Registration
Text: In addition, for a road vehicle it is stated:
- the registration plate, the date on which the registration plate was assigned,
- the date of first registration of the road vehicle,
- the State of last registration, the number of the registration certificate of the road vehicle or similar document issued in the State of last registration and the registration plate of the road vehicle if the State of last registration is not the Czech Republic,

Output:
- {"name": "registration date", "inference": "the date of first registration of the road vehicle", "data_type": "string", "cardinality": ""}
- {"name": "state of registration", "inference": "the state of last registration of the road vehicle", "data_type": "string", "cardinality": ""}
- {"name": "registration plate", "inference": "the registration plate", "data_type": "string", "cardinality": "0..1"}
- {"name": "registration plate assignment date", "inference": "the date on which the registration plate was assigned", "data_type": "string", "cardinality": "0..1"}


## RegistrationCertificate
Text: In addition, for a road vehicle it is stated:
- the number of the registration certificate of the road vehicle,

Output:
- {"name": "number", "inference": "the number of the registration certificate", "data_type": "number", "cardinality": ""}


## RegistrationApplication
Text: The applicant shall attach to the application for registration of a road vehicle in the Register of Road Vehicles a proof of the vehicle's roadworthiness. In addition, the applicant shall attach proof of a technical inspection if it is a road vehicle in operation, except for a road vehicle registered in another Member State for which the period for the first periodic technical inspection has not expired since the date of its first registration on the date of application.

Output:
- {"name": "proof of vehicle roadworthiness", "inference": "attach to the application for registration a proof of the vehicle's roadworthiness", "data_type": "string", "cardinality": ""}
- {"name": "proof of technical inspection", "inference": "attach to the application for registration proof of a technical inspection", "data_type": "string", "cardinality": ""}


## ThirdPartyInsurance
Text: In addition, for a road vehicle it is stated:
- information on the insurance against liability for damage caused by the operation of the vehicle (hereinafter referred to as 'third party insurance') communicated by the Czech Insurance Office, including the date of notification of data by the Czech Insurers' Bureau, the date of commencement of insurance, the period of interruption of insurance, the date of change of insurance, and the date of termination of insurance,

Output:
- {"name": "date of notification", "inference": "the date of notification", "data_type": "string", "cardinality": ""}
- {"name": "date of commencement", "inference": "the date of commencement of insurance", "data_type": "string", "cardinality": ""}
- {"name": "period of interruption", "inference": "the period of interruption of insurance", "data_type": "string", "cardinality": ""}
- {"name": "date of change", "inference": "the date of change of insurance", "data_type": "string", "cardinality": ""}
- {"name": "date of termination", "inference": "the date of termination of insurance", "data_type": "string", "cardinality": ""}


## InsuranceContract
Text: The insurance contract shall always contain the designation of the insurer and the policyholder and the particulars of the vehicle, the duration of the insurance, the limit of the insurance benefit, the amount of the premium, its maturity and the method of payment and the form and place of notification of the claim.

Output:
- {"name": "duration of insurance", "inference": "the insurance contract shall always contain the duration of the insurance", "data_type": "string", "cardinality": ""}
- {"name": "limit of insurance benefits", "inference": "the insurance contract shall always contain the limit of the insurance benefit", "data_type": "string", "cardinality": ""}
- {"name": "amount of premium", "inference": "the insurance contract shall always contain the amount of the premium", "data_type": "string", "cardinality": ""}
- {"name": "maturity", "inference": "the insurance contract shall always contain its maturity", "data_type": "string", "cardinality": ""}
- {"name": "method of payment", "inference": "the insurance contract shall always contain the method of payment", "data_type": "string", "cardinality": ""}
- {"name": "form of notification of claim", "inference": "the insurance contract shall always contain the form of notification of the claim", "data_type": "string", "cardinality": ""}
- {"name": "place of notification of claim", "inference": "the insurance contract shall always contain the place of notification of the claim", "data_type": "string", "cardinality": ""}


## Engine
Text: In addition, for a road vehicle it is stated:
- the engine data for the road vehicle that include the type of engine specified by the manufacturer of the road vehicle, the engine power specified by the road vehicle manufacturer in kW/rpm in the case of an internal combustion engine or in kW in the case of other engines, the displacement of the internal combustion engine as specified by the manufacturer of the road vehicle in cm3; and the fuel type of the road vehicle

Output:
- {"name": "engine type", "inference": "type of engine specified by the manufacturer of the road vehicle", "data_type": "string", "cardinality": ""}
- {"name": "engine power", "inference": "engine power specified by the road vehicle manufacturer", "data_type": "integer", "cardinality": ""},
- {"name": "fuel type", "inference": "the engine data for the road vehicle that include the fuel type of the road vehicle", "data_type": "string", "cardinality": ""}


## InternalCombustionEngine
Text: In addition, for a road vehicle it is stated:
- the engine data for the road vehicle that include the type of engine specified by the manufacturer of the road vehicle, the engine power specified by the road vehicle manufacturer in kW/rpm in the case of an internal combustion engine or in kW in the case of other engines, the displacement of the internal combustion engine as specified by the manufacturer of the road vehicle in cm3; and the fuel type of the road vehicle

Output:
- {"name": "displacement", "inference": "the displacement of the internal combustion engine", "data_type": "string", "cardinality": ""}


## BodyWork
Text: In addition, for a road vehicle it is stated:
- type, serial number and colour of bodywork, number of seats and standing places or beds, dimensions of the loading area, volume of the box or tank

Output:
- {"name": "type", "inference": "type of bodywork", "data_type": "string", "cardinality": ""}
- {"name": "serial number", "inference": "serial number of bodywork", "data_type": "string", "cardinality": ""}
- {"name": "color", "inference": "colour of bodywork", "data_type": "string", "cardinality": ""}


## TechnicalInspection
Text: In addition, for a road vehicle it is stated:
- data on technical inspections of the road vehicle which is the type of technical inspection carried out, the date on which the technical inspection was carried out, the date of validity of the technical inspection, the designation of the technical inspection station and data on the condition of the road vehicle according to the result of the technical inspection

Output:
- {"name": "type", "inference": "type of technical inspection carried out", "data_type": "string", "cardinality": ""}
- {"name": "date", "inference": "date on which the technical inspection was carried out", "data_type": "string", "cardinality": ""}
- {"name": "date of validity", "inference": "date of validity of the technical inspection", "data_type": "string", "cardinality": ""}
- {"name": "condition", "inference": "data on the condition of the road vehicle according to the result of the technical inspection", "data_type": "string", "cardinality": ""}
- {"name": "result", "inference": "result of the technical inspection", "data_type": "string", "cardinality": ""}

## TechnicalInspectionReport
Text: If a technical inspection reveals a serious defect, the vehicle is technically fit for use only for 30 days from the date of issue of the technical inspection report.

Output:
- {"name": "date of issue", "inference": "the date of issue of the technical inspection report", "data_type": "string", "cardinality": ""}
