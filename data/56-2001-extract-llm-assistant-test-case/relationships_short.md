# Relationships test cases with only relevant text


## MotorisedVehicle "0..*" --> "1..1" RoadVehicleType : has type
Text: A type of road vehicle is defined as a set of road vehicles which are identical in at least their basic characteristics. ... the type as specified by the motorised vehicle manufacturer

- reason why RoadVehicleType is an entity: "A type of road vehicle is defined as a set of road vehicles which are identical in at least their basic characteristics"

Output:
- {"name": "has type", "inference": "the type as specified by the motorised vehicle manufacturer", "source_entity": "MotorisedVehicle", "target_entity": "VehicleType", "cardinality": "0..* --> 1..1"}


## MotorisedVehicle --|> RoadVehicle
Text: For the purposes of regulating the conditions of operation of road vehicles on roads, a road vehicle is a motorised or non-motorised vehicle which is constructed for use on roads for the carriage of persons, animals or goods.

Output:
- {"name": "is-a", "inference": "road vehicle is a motorised vehicle", "source_entity": "MotorisedVehicle", "target_entity": "RoadVehicle", "cardinality": ""}


## NonMotorisedVehicle --|> RoadVehicle
Text: For the purposes of regulating the conditions of operation of road vehicles on roads, a road vehicle is a motorised or non-motorised vehicle which is constructed for use on roads for the carriage of persons, animals or goods.

Output:
- {"name": "is-a", "inference": "road vehicle is a non-motorised vehicle", "source_entity": "NonMotorisedVehicle", "target_entity": "RoadVehicle", "cardinality": ""}


## SpecialVehicle --|> RoadVehicle
Text: A special vehicle is a road vehicle manufactured for purposes other than road traffic, which may be operated on roads if conditions are met.

Output:
- {"name": "is-a", "inference": "special vehicle is a road vehicle", "source_entity": "SpecialVehicle", "target_entity": "RoadVehicle", "cardinality": ""}


## Motorcycle --|> RoadVehicle
Text: Road vehicles are divided into the following basic types: motorcycles, passenger cars, buses, lorries, special purpose vehicles, trailers, powered wheelchairs if their width or length exceeds 1.4 m, their design speed exceeds 15 km.h-1 or their maximum permissible weight exceeds 450 kg, and other road vehicles.

Output:
- {"name": "is-a", "inference": "Road vehicles are divided into the following basic types: motorcycles", "source_entity": "Motorcycle", "target_entity": "RoadVehicle", "cardinality": ""}


## PassengerCar --|> RoadVehicle
Text: Road vehicles are divided into the following basic types: motorcycles, passenger cars, buses, lorries, special purpose vehicles, trailers, powered wheelchairs if their width or length exceeds 1.4 m, their design speed exceeds 15 km.h-1 or their maximum permissible weight exceeds 450 kg, and other road vehicles.

Output:
- {"name": "is-a", "inference": "Road vehicles are divided into the following basic types: ... passenger cars", "source_entity": "PassengerCar", "target_entity": "RoadVehicle", "cardinality": ""}


## Bus --|> RoadVehicle
Text: Road vehicles are divided into the following basic types: motorcycles, passenger cars, buses, lorries, special purpose vehicles, trailers, powered wheelchairs if their width or length exceeds 1.4 m, their design speed exceeds 15 km.h-1 or their maximum permissible weight exceeds 450 kg, and other road vehicles.

Output:
- {"name": "is-a", "inference": "Road vehicles are divided into the following basic types: ... buses", "source_entity": "Bus", "target_entity": "RoadVehicle", "cardinality": ""}


## Lorry --|> RoadVehicle
Text: Road vehicles are divided into the following basic types: motorcycles, passenger cars, buses, lorries, special purpose vehicles, trailers, powered wheelchairs if their width or length exceeds 1.4 m, their design speed exceeds 15 km.h-1 or their maximum permissible weight exceeds 450 kg, and other road vehicles.

Output:
- {"name": "is-a", "inference": "Road vehicles are divided into the following basic types: ... lorries", "source_entity": "Lorry", "target_entity": "RoadVehicle", "cardinality": ""}


## SpecialPurposeVehicle --|> RoadVehicle
Text: Road vehicles are divided into the following basic types: motorcycles, passenger cars, buses, lorries, special purpose vehicles, trailers, powered wheelchairs if their width or length exceeds 1.4 m, their design speed exceeds 15 km.h-1 or their maximum permissible weight exceeds 450 kg, and other road vehicles.

Output:
- {"name": "is-a", "inference": "Road vehicles are divided into the following basic types: ... special purpose vehicles", "source_entity": "SpecialPurposeVehicle", "target_entity": "RoadVehicle", "cardinality": ""}


## PoweredWheelchair --|> RoadVehicle
Text: Road vehicles are divided into the following basic types: motorcycles, passenger cars, buses, lorries, special purpose vehicles, trailers, powered wheelchairs if their width or length exceeds 1.4 m, their design speed exceeds 15 km.h-1 or their maximum permissible weight exceeds 450 kg, and other road vehicles.

Output:
- {"name": "is-a", "inference": "Road vehicles are divided into the following basic types: ... powered wheelchairs", "source_entity": "PoweredWheelchair", "target_entity": "RoadVehicle", "cardinality": ""}


## Trailer --|> NonMotorisedVehicle
Text: A trailer is a non-motorised road vehicle intended to be towed by another road vehicle to which it is coupled in a combination.

Output:
- {"name": "is-a", "inference": "trailer is a non-motorised road vehicle", "source_entity": "Trailer", "target_entity": "NonMotorisedVehicle", "cardinality": ""}


## RoadVehicle "1..1" --> "1..*" StructuralComponent : has a component
Text: A structural component of a road vehicle is a component of the road vehicle which must be type-approved independently of the road vehicle if so provided for in the implementing legislation and which is subject to the technical requirements laid down in the implementing legislation. An example of a structural component of a road vehicle is a lamp.

Output:
- {"name": "has a component", "inference": "structural component of a road vehicle is a component of the road vehicle", "source_entity": "RoadVehicle", "target_entity": "StructuralComponent", "cardinality": "1..1 --> 1..*"}


## Manufacturer --|> Person
Text: A manufacturer is a person who manufactures a road vehicle, its system, component or separate technical unit or has it designed or manufactured and markets it under his own name or trademark or uses it for his own account.

Output:
- {"name": "is-a", "inference": "manufacturer is a person", "source_entity": "Manufacturer", "target_entity": "Person", "cardinality": ""}


## Manufacturer "1..1" --> "0..*" Component : manufactures component
Text: A manufacturer is a person who manufactures a road vehicle, its system, component or separate technical unit or has it designed or manufactured and markets it under his own name or trademark or uses it for his own account.

Output:
- {"name": "manufactures component", "inference": "manufacturer is a person who manufactures ... component", "source_entity": "Manufacturer", "target_entity": "Component", "cardinality": "1..1 --> 0..*"}


## Manufacturer "1..1" --> "0..*" RoadVehicle : manufactures road vehicle
Text: A manufacturer is a person who manufactures a road vehicle, its system, component or separate technical unit or has it designed or manufactured and markets it under his own name or trademark or uses it for his own account.

Output:
- {"name": "manufactures road vehicle", "inference": "manufacturer is a person who manufactures a road vehicle", "source_entity": "Manufacturer", "target_entity": "RoadVehicle", "cardinality": "1..1 --> 0..*"}


## Manufacturer "1..1" --> "0..*" RoadVehicleSystem : manufactures system
Text: A manufacturer is a person who manufactures a road vehicle, its system, component or separate technical unit or has it designed or manufactured and markets it under his own name or trademark or uses it for his own account.

Output:
- {"name": "manufactures system", "inference": "manufacturer is a person who manufactures a road vehicle, its system", "source_entity": "Manufacturer", "target_entity": "RoadVehicleSystem", "cardinality": "1..1 --> 0..*"}


## AgriculturalTractor --|> SpecialVehicle
Text: Special vehicles are divided into the following basic types: agricultural or forestry tractors and their trailers, self-propelled work machines, work machines carried, work machines attached, interchangeable towed equipment, vehicles designed primarily for driving on snow, vehicles designed primarily for off-road driving, single-axle tractors and their trailers, special tractors and their trailers, carriers of working adaptors and other special vehicles.

Output:
- {"name": "is-a", "inference": "Special vehicles are divided into the following basic types: agricultural ... tractors", "source_entity": "AgriculturalTractor", "target_entity": "SpecialVehicle", "cardinality": ""}


## ForestryTractor --|> SpecialVehicle
Text: Special vehicles are divided into the following basic types: agricultural or forestry tractors and their trailers, self-propelled work machines, work machines carried, work machines attached, interchangeable towed equipment, vehicles designed primarily for driving on snow, vehicles designed primarily for off-road driving, single-axle tractors and their trailers, special tractors and their trailers, carriers of working adaptors and other special vehicles.

Output:
- {"name": "is-a", "inference": "Special vehicles are divided into the following basic types: ... forestry tractors", "source_entity": "ForestryTractor", "target_entity": "SpecialVehicle", "cardinality": ""}


## SingleAxleTractor --|> SpecialVehicle
Text: Special vehicles are divided into the following basic types: agricultural or forestry tractors and their trailers, self-propelled work machines, work machines carried, work machines attached, interchangeable towed equipment, vehicles designed primarily for driving on snow, vehicles designed primarily for off-road driving, single-axle tractors and their trailers, special tractors and their trailers, carriers of working adaptors and other special vehicles.

Output:
- {"name": "is-a", "inference": "Special vehicles are divided into the following basic types: ... single-axle tractors", "source_entity": "SingleAxleTractor", "target_entity": "SpecialVehicle", "cardinality": ""}


## SpecialTractor --|> SpecialVehicle
Text: Special vehicles are divided into the following basic types: agricultural or forestry tractors and their trailers, self-propelled work machines, work machines carried, work machines attached, interchangeable towed equipment, vehicles designed primarily for driving on snow, vehicles designed primarily for off-road driving, single-axle tractors and their trailers, special tractors and their trailers, carriers of working adaptors and other special vehicles.

Output:
- {"name": "is-a", "inference": "Special vehicles are divided into the following basic types: ... special tractors", "source_entity": "SpecialTractor", "target_entity": "SpecialVehicle", "cardinality": ""}


## RoadVehicleType "1..1" *- "0..*" RoadVehicleTypeVariant : includes variant
Text: A road vehicle type may include variants and versions.

Output:
- {"name": "includes variant", "inference": "road vehicle type may include variants", "source_entity": "RoadVehicleType", "target_entity": "RoadVehicleTypeVariant", "cardinality": "1..1 *- 0..*"}


## RoadVehicleType "1..1" *- "0..*" RoadVehicleTypeVersion : includes version
Text: A road vehicle type may include variants and versions.

Output:
- {"name": "includes version", "inference": "road vehicle type may include ... versions", "source_entity": "RoadVehicleType", "target_entity": "RoadVehicleTypeVersion", "cardinality": "1..1" *- "0..*"}


## TractorTrailer --|> Trailer
Text: Special vehicles are divided into the following basic types: agricultural or forestry tractors and their trailers, self-propelled work machines, work machines carried, work machines attached, interchangeable towed equipment, vehicles designed primarily for driving on snow, vehicles designed primarily for off-road driving, single-axle tractors and their trailers, special tractors and their trailers, carriers of working adaptors and other special vehicles.
A trailer is a non-motorised road vehicle intended to be towed by another vehicle to which it is coupled in a combination.

Output:
- {"name": "is-a", "inference": "tractors and their trailers", "source_entity": "TractorTrailer", "target_entity": "Trailer", "cardinality": ""}


## SelfPropelledWorkMachine --|> SpecialVehicle
Text: Special vehicles are divided into the following basic types: agricultural or forestry tractors and their trailers, self-propelled work machines, work machines carried, work machines attached, interchangeable towed equipment, vehicles designed primarily for driving on snow, vehicles designed primarily for off-road driving, single-axle tractors and their trailers, special tractors and their trailers, carriers of working adaptors and other special vehicles.

Output:
- {"name": "is-a", "inference": "Special vehicles are divided into the following basic types: ... self-propelled work machines", "source_entity": "SelfPropelledWorkMachine", "target_entity": "SpecialVehicle", "cardinality": ""}


## WorkMachineCarried --|> SpecialVehicle
Text: Special vehicles are divided into the following basic types: agricultural or forestry tractors and their trailers, self-propelled work machines, work machines carried, work machines attached, interchangeable towed equipment, vehicles designed primarily for driving on snow, vehicles designed primarily for off-road driving, single-axle tractors and their trailers, special tractors and their trailers, carriers of working adaptors and other special vehicles.

Output:
- {"name": "is-a", "inference": "Special vehicles are divided into the following basic types: ... work machines carried", "source_entity": "WorkMachineCarried", "target_entity": "SpecialVehicle", "cardinality": ""}


## WorkMachineAttached --|> SpecialVehicle
Text: Special vehicles are divided into the following basic types: agricultural or forestry tractors and their trailers, self-propelled work machines, work machines carried, work machines attached, interchangeable towed equipment, vehicles designed primarily for driving on snow, vehicles designed primarily for off-road driving, single-axle tractors and their trailers, special tractors and their trailers, carriers of working adaptors and other special vehicles.

Output:
- {"name": "is-a", "inference": "Special vehicles are divided into the following basic types: ... work machines attached", "source_entity": "WorkMachineAttached", "target_entity": "SpecialVehicle", "cardinality": ""}


## InterchangeableTowedEquipment --|> SpecialVehicle
Text: Special vehicles are divided into the following basic types: agricultural or forestry tractors and their trailers, self-propelled work machines, work machines carried, work machines attached, interchangeable towed equipment, vehicles designed primarily for driving on snow, vehicles designed primarily for off-road driving, single-axle tractors and their trailers, special tractors and their trailers, carriers of working adaptors and other special vehicles.

Output:
- {"name": "is-a", "inference": "Special vehicles are divided into the following basic types: ... interchangeable towed equipment", "source_entity": "InterchangeableTowedEquipment", "target_entity": "SpecialVehicle", "cardinality": ""}


## SnowVehicles --|> SpecialVehicle
Text: Special vehicles are divided into the following basic types: agricultural or forestry tractors and their trailers, self-propelled work machines, work machines carried, work machines attached, interchangeable towed equipment, vehicles designed primarily for driving on snow, vehicles designed primarily for off-road driving, single-axle tractors and their trailers, special tractors and their trailers, carriers of working adaptors and other special vehicles.

Output:
- {"name": "is-a", "inference": "Special vehicles are divided into the following basic types: ... vehicles designed primarily for driving on snow", "source_entity": "SnowVehicles", "target_entity": "SpecialVehicle", "cardinality": ""}


## OffroadVehicles --|> SpecialVehicle
Text: Special vehicles are divided into the following basic types: agricultural or forestry tractors and their trailers, self-propelled work machines, work machines carried, work machines attached, interchangeable towed equipment, vehicles designed primarily for driving on snow, vehicles designed primarily for off-road driving, single-axle tractors and their trailers, special tractors and their trailers, carriers of working adaptors and other special vehicles.

Output:
- {"name": "is-a", "inference": "Special vehicles are divided into the following basic types: ... vehicles designed primarily for off-road driving", "source_entity": "OffroadVehicles", "target_entity": "SpecialVehicle", "cardinality": ""}


## CarrierOfWorkingAdaptors --|> SpecialVehicle
Text: Special vehicles are divided into the following basic types: agricultural or forestry tractors and their trailers, self-propelled work machines, work machines carried, work machines attached, interchangeable towed equipment, vehicles designed primarily for driving on snow, vehicles designed primarily for off-road driving, single-axle tractors and their trailers, special tractors and their trailers, carriers of working adaptors and other special vehicles.

Output:
- {"name": "is-a", "inference": "Special vehicles are divided into the following basic types: ... carriers of working adaptors", "source_entity": "CarrierOfWorkingAdaptors", "target_entity": "SpecialVehicle", "cardinality": ""}


## RoadVehicle "1..1" --> "1..*" RoadVehicleSystem : has a structural system
Text: Road vehicle system means any structural system of a road vehicle which is subject to the technical requirements laid down in an implementing regulation. An example of a road vehicle system is brakes or emission reduction devices.

Output:
- {"name": "has a structural system", "inference": "Road vehicle system means any structural system of a road vehicle", "source_entity": "RoadVehicle", "target_entity": "RoadVehicleSystem", "cardinality": "1..1 --> 1..*"}


## IncompleteRoadVehicle --|> RoadVehicle
Text: The municipal authority of a municipality with extended competence shall enter a road vehicle, the roadworthiness of which is subject to approval, in the register of road vehicles on the basis of a written application by the owner of the road vehicle
...
- it is not an incomplete road vehicle

Output:
- {"name": "is-a", "inference": "road vehicle ... it is not an incomplete road vehicle", "source_entity": "IncompleteRoadVehicle", "target_entity": "RoadVehicle", "cardinality": ""}


## Owner --|> Person
Text: The following information on the owner and operator, if different from the owner, of a road vehicle shall be entered in the register of road vehicles.
- If the person is a natural person, his name, or, where applicable, first and last names, the address of his permanent residence, long-term residence, temporary residence of at least 6 months or other authorised residence and his birth number, if any, and, where applicable, his date of birth shall be entered.

Output:
- {"name": "is-a", "inference": "owner of a road vehicle ... the person", "source_entity": "Owner", "target_entity": "Person", "cardinality": ""}


## Operator --|> Person
Text: The following information on the owner and operator, if different from the owner, of a road vehicle shall be entered in the register of road vehicles.
- If the person is a natural person, his name, or, where applicable, first and last names, the address of his permanent residence, long-term residence, temporary residence of at least 6 months or other authorised residence and his birth number, if any, and, where applicable, his date of birth shall be entered.

Output:
- {"name": "is-a", "inference": "operator of a road vehicle ... the person", "source_entity": "Operator", "target_entity": "Person", "cardinality": ""}


## Owner "1..1" --> "0..*" RoadVehicle : owns
Text: The following information on the owner and operator, if different from the owner, of a road vehicle shall be entered in the register of road vehicles.

Output:
- {"name": "owns", "inference": "information on the owner of a road vehicle", "source_entity": "Owner", "target_entity": "RoadVehicle", "cardinality": "1..1 --> 0..*"}


## Operator "1..1" --> "0..*" RoadVehicle : operates
Text: The following information on the owner and operator, if different from the owner, of a road vehicle shall be entered in the register of road vehicles.

Output:
- {"name": "operates", "inference": "operator of a road vehicle", "source_entity": "Operator", "target_entity": "RoadVehicle", "cardinality": "1..1 --> 0..*"}


## NaturalPerson --|> Person
Text: The following information on the owner and operator, if different from the owner, of a road vehicle shall be entered in the register of road vehicles.
- If the person is a natural person, his name, or, where applicable, first and last names, the address of his permanent residence, long-term residence, temporary residence of at least 6 months or other authorised residence and his birth number, if any, and, where applicable, his date of birth shall be entered.

Output:
- {"name": "is-a", "inference": "If the person is a natural person", "source_entity": "NaturalPerson", "target_entity": "Person", "cardinality": ""}


## NaturalPerson "0..*" --> "0..1" Address : has permanent residence
Text: The following information on the owner and operator, if different from the owner, of a road vehicle shall be entered in the register of road vehicles.
- If the person is a natural person, his name, or, where applicable, first and last names, the address of his permanent residence, long-term residence, temporary residence of at least 6 months or other authorised residence and his birth number, if any, and, where applicable, his date of birth shall be entered.

Output:
- {"name": "has permanent residence", "inference": "If the person is a natural person, ... the address of his permanent residence", "source_entity": "NaturalPerson", "target_entity": "Address", "cardinality": "0..* --> 0..1"}


## NaturalPerson "0..*" --> "0..1" Address : has long-term residence
Text: The following information on the owner and operator, if different from the owner, of a road vehicle shall be entered in the register of road vehicles.
- If the person is a natural person, his name, or, where applicable, first and last names, the address of his permanent residence, long-term residence, temporary residence of at least 6 months or other authorised residence and his birth number, if any, and, where applicable, his date of birth shall be entered.

Output:
- {"name": "has long-term residence", "inference": "If the person is a natural person, ... the address of his ... long-term residence", "source_entity": "NaturalPerson", "target_entity": "Address", "cardinality": "0..* --> 0..1"}


## NaturalPerson "0..*" --> "0..1" Address : has temporary residence
Text: The following information on the owner and operator, if different from the owner, of a road vehicle shall be entered in the register of road vehicles.
- If the person is a natural person, his name, or, where applicable, first and last names, the address of his permanent residence, long-term residence, temporary residence of at least 6 months or other authorised residence and his birth number, if any, and, where applicable, his date of birth shall be entered.

Output:
- {"name": "has temporary residence", "inference": "If the person is a natural person, ... the address of his ... temporary residence", "source_entity": "NaturalPerson", "target_entity": "Address", "cardinality": "0..* --> 0..1"}


## NaturalPerson "0..*" --> "0..1" Address : has other authorised residence
Text: The following information on the owner and operator, if different from the owner, of a road vehicle shall be entered in the register of road vehicles.
- If the person is a natural person, his name, or, where applicable, first and last names, the address of his permanent residence, long-term residence, temporary residence of at least 6 months or other authorised residence and his birth number, if any, and, where applicable, his date of birth shall be entered.

Output:
- {"name": "has other authorised residence", "inference": "If the person is a natural person, ... the address of his ... other authorised residence", "source_entity": "NaturalPerson", "target_entity": "Address", "cardinality": "0..* --> 0..1"}


## BusinessNaturalPerson --|> Person
Text: The following information on the owner and operator, if different from the owner, of a road vehicle shall be entered in the register of road vehicles.
- If the person is a natural person engaged in business, then the business name or first and last names, if any, and, where appropriate, a distinguishing supplement, the address of permanent residence, long-term residence, temporary residence of at least 6 months or other authorised residence, the address of the registered office and the personal identification number, if any.

Output:
- {"name": "is-a", "inference": "If the person is engaged in business", "source_entity": "BusinessNaturalPerson", "target_entity": "Person", "cardinality": ""}


## BusinessNaturalPerson "0..*" --> "0..1" Address : has permanent residence
Text: The following information on the owner and operator, if different from the owner, of a road vehicle shall be entered in the register of road vehicles.
- If the person is a natural person engaged in business, then the business name or first and last names, if any, and, where appropriate, a distinguishing supplement, the address of permanent residence, long-term residence, temporary residence of at least 6 months or other authorised residence, the address of the registered office and the personal identification number, if any.

Output:
- {"name": "has permanent residence", "inference": "If the person is a natural person, the address of permanent residence", "source_entity": "BusinessNaturalPerson", "target_entity": "Address", "cardinality": "0..* --> 0..1"}


## BusinessNaturalPerson "0..*" --> "0..1" Address : has long-term residence
Text: The following information on the owner and operator, if different from the owner, of a road vehicle shall be entered in the register of road vehicles.
- If the person is a natural person engaged in business, then the business name or first and last names, if any, and, where appropriate, a distinguishing supplement, the address of permanent residence, long-term residence, temporary residence of at least 6 months or other authorised residence, the address of the registered office and the personal identification number, if any.

Output:
- {"name": "has long-term residence", "inference": "If the person is a natural person, the address of long-term residence", "source_entity": "BusinessNaturalPerson", "target_entity": "Address", "cardinality": "0..* --> 0..1"}


## BusinessNaturalPerson "0..*" --> "0..1" Address : has temporary residence
Text: The following information on the owner and operator, if different from the owner, of a road vehicle shall be entered in the register of road vehicles.
- If the person is a natural person engaged in business, then the business name or first and last names, if any, and, where appropriate, a distinguishing supplement, the address of permanent residence, long-term residence, temporary residence of at least 6 months or other authorised residence, the address of the registered office and the personal identification number, if any.

Output:
- {"name": "has temporary residence", "inference": "If the person is a natural person, the address of temporary residence", "source_entity": "BusinessNaturalPerson", "target_entity": "Address", "cardinality": "0..* --> 0..1"}


## BusinessNaturalPerson "0..*" --> "0..1" Address : other authorised residence
Text: The following information on the owner and operator, if different from the owner, of a road vehicle shall be entered in the register of road vehicles.
- If the person is a natural person engaged in business, then the business name or first and last names, if any, and, where appropriate, a distinguishing supplement, the address of permanent residence, long-term residence, temporary residence of at least 6 months or other authorised residence, the address of the registered office and the personal identification number, if any.

Output:
- {"name": "other authorised residence", "inference": "If the person is a natural person, the address of other authorised residence", "source_entity": "BusinessNaturalPerson", "target_entity": "Address", "cardinality": "0..* --> 0..1"}


## BusinessNaturalPerson "0..*" --> "0..1" Address : has registered office
Text: The following information on the owner and operator, if different from the owner, of a road vehicle shall be entered in the register of road vehicles.
- If the person is a natural person engaged in business, then the business name or first and last names, if any, and, where appropriate, a distinguishing supplement, the address of permanent residence, long-term residence, temporary residence of at least 6 months or other authorised residence, the address of the registered office and the personal identification number, if any.

Output:
- {"name": "has registered office", "inference": "If the person is a natural person, the address of the registered office", "source_entity": "BusinessNaturalPerson", "target_entity": "Address", "cardinality": "0..* --> 0..1"}


## LegalPerson --|> Person
Text: The following information on the owner and operator, if different from the owner, of a road vehicle shall be entered in the register of road vehicles.
- If it is a legal person or a branch thereof, then the business name or name, the address of the registered office or the location of the branch and the personal identification number, if any, shall be indicated.

Output:
- {"name": "is-a", "inference": "If it is a legal person", "source_entity": "LegalPerson", "target_entity": "Person", "cardinality": ""}


## LegalPerson "0..*" --> "0..1" Address : has registered office
Text: The following information on the owner and operator, if different from the owner, of a road vehicle shall be entered in the register of road vehicles.
- If it is a legal person or a branch thereof, then the business name or name, the address of the registered office or the location of the branch and the personal identification number, if any, shall be indicated.

Output:
- {"name": "has registered office", "inference": "If it is a legal person, the address of the registered office", "source_entity": "LegalPerson", "target_entity": "Address", "cardinality": "0..* --> 0..1"}


## LegalPerson "0..*" --> "0..1" Address : has location
Text: The following information on the owner and operator, if different from the owner, of a road vehicle shall be entered in the register of road vehicles.
- If it is a legal person or a branch thereof, then the business name or name, the address of the registered office or the location of the branch and the personal identification number, if any, shall be indicated.

Output:
- {"name": "has location", "inference": "If it is a legal person ... the location", "source_entity": "LegalPerson", "target_entity": "Address", "cardinality": "0..* --> 0..1"}


## LegalPerson "0..*" --> "0..1" LegalPersonBranch : has branch
Text: The following information on the owner and operator, if different from the owner, of a road vehicle shall be entered in the register of road vehicles.
- If it is a legal person or a branch thereof, then the business name or name, the address of the registered office or the location of the branch and the personal identification number, if any, shall be indicated.

Output:
- {"name": "has branch", "inference": "If it is a legal person, the location of the branch", "source_entity": "LegalPerson", "target_entity": "LegalPersonBranch", "cardinality": "0..* --> 0..1"}


## RegistrationCertificate "1..1" --> "1..1" Registration : certifies
Text: In addition, for a road vehicle it is stated:
- the number of the registration certificate of the road vehicle or similar document issued in the State of last registration and the registration plate of the road vehicle if the State of last registration is not the Czech Republic

- note: the name of this relationship cannot be inferred from the text


Output:
- {"name": "certifies", "inference": "registration certificate of the road vehicle issued in the State of last registration", "source_entity": "RegistrationCertificate", "target_entity": "Registration", "cardinality": "1..1 --> 1..1"}


## Registration "0..1" --> "1..1" RoadVehicle : registers
Text: When registering a road vehicle in the register of road vehicles, the municipal authority of the municipality with extended competence shall issue a certificate of registration of the road vehicle to the applicant.

Output:
- {"name": "registers", "inference": "registering a road vehicle in the register of road vehicles", "source_entity": "Registration", "target_entity": "RoadVehicle", "cardinality": "0..1 --> 1..1"}


## RegistrationApplication "0..1" o-> "0..1" GreenCard : contains
Text: An application for registration of a road vehicle in the register of road vehicles shall include
- a green card issued under the Motor Third Party Insurance Act

Output:
- {"name": "contains", "inference": "application for registration of a road vehicle shall include ... a green card", "source_entity": "RegistrationApplication", "target_entity": "GreenCard", "cardinality": "0..1 o-> 1..1"}


## RegistrationApplication "1..1" --> "0..1" RoadVehicleRegistration : results into
Text: An application for registration of a road vehicle in the register of road vehicles shall include

Output:
- {"name": "results into", "inference": "application for registration of a road vehicle in the register of road vehicles", "source_entity": "RegistrationApplication", "target_entity": "RoadVehicleRegistration", "cardinality": "1..1 --> 0..1"}


## Owner "1..1" --> "0..*" RegistrationApplication : applies for
Text: The municipal authority of a municipality with extended competence shall enter a road vehicle, the roadworthiness of which is subject to approval, in the register of road vehicles on the basis of a written application by the owner of the road vehicle

Output:
- {"name": "results into", "inference": "shall enter ... in the register of road vehicles on the basis of a written application by the owner of the road vehicle", "source_entity": "Owner", "target_entity": "RegistrationApplication", "cardinality": "1..1 --> 0..*"}


## RegistrationApplication "0..*" --> "0..1" CertificateOfPayment : has attached certification of payment of value added tax
Text: An application for registration of a road vehicle in the register of road vehicles shall include
- a certificate of payment of value added tax in the case of the purchase of a new vehicle from another Member State.

Output:
- {"name": "has attached certification of payment of value added tax", "inference": "application for registration of a road vehicle in the register of road vehicles shall include ... a certificate of payment of value added tax", "source_entity": "RegistrationApplication", "target_entity": "CertificateOfPayment", "cardinality": "0..* --> 0..1"}


## RoadVehicle "1..1" --> "1..1" ThirdPartyInsurance : insured by
Text: Green Card means an international certificate proving that the road vehicle has been covered by a third party insurance contract for the road vehicle specified in the certificate.
Output:
- {"name": "insured by", "inference": "road vehicle has been covered by a third party insurance", "source_entity": "RoadVehicle", "target_entity": "ThirdPartyInsurance", "cardinality": "1..1 --> 1..1"}


## ThirdPartyInsurance "1..1" --> "1..1" InsuranceContract : is based on
Text: Green Card means an international certificate proving that the road vehicle has been covered by a third party insurance contract for the road vehicle specified in the certificate. Liability insurance is based on an insurance contract concluded between the policyholder and the insurer.

Output:
- {"name": "is based on", "inference": "road vehicle has been covered by a third party insurance ... insurance is based on an insurance contract", "source_entity": "ThirdPartyInsurance", "target_entity": "InsuranceContract", "cardinality": "1..1 --> 1..1"}


## PolicyHolder --|> Person
Text: The policyholder is the person who has concluded a contract of liability insurance with the insurer.

Output:
- {"name": "is-a", "inference": "policyholder is the person", "source_entity": "PolicyHolder", "target_entity": "Person", "cardinality": ""}


## InsuranceContract "0..*" --> "1..1" PolicyHolder : has policyholder
Text: The insurance contract shall always contain the designation of the insurer and the policyholder and the particulars of the road vehicle, the duration of the insurance, the limit of the insurance benefit, the amount of the premium, its maturity and the method of payment and the form and place of notification of the claim.

Output:
- {"name": "has policyholder", "inference": "insurance contract shall always contain the designation of ... the policyholder", "source_entity": "InsuranceContract", "target_entity": "PolicyHolder", "cardinality": "0..* --> 1..1"}


## InsuranceContract "0..*" --> "1..1" Insurer : has insurer
Text: The insurance contract shall always contain the designation of the insurer and the policyholder and the particulars of the road vehicle, the duration of the insurance, the limit of the insurance benefit, the amount of the premium, its maturity and the method of payment and the form and place of notification of the claim.

Output:
- {"name": "has insurer", "inference": "insurance contract shall always contain the designation of the insurer", "source_entity": "InsuranceContract", "target_entity": "Insurer", "cardinality": "0..* --> 1..1"}


## InsuranceContract "1..1" --> "1..1" RoadVehicle : insures vehicle
Text: The insurance contract shall always contain the designation of the insurer and the policyholder and the particulars of the road vehicle, the duration of the insurance, the limit of the insurance benefit, the amount of the premium, its maturity and the method of payment and the form and place of notification of the claim.

Output:
- {"name": "insures vehicle", "inference": "insurance contract shall always contain ... the particulars of the road vehicle", "source_entity": "InsuranceContract", "target_entity": "RoadVehicle", "cardinality": "1..1 --> 1..1"}


## Insurer --|> InsuranceCompany
Text: The insurer is an insurance company authorised to operate liability insurance in the Czech Republic.

Output:
- {"name": "is-a", "inference": "insurer is an insurance company", "source_entity": "Insurer", "target_entity": "InsuranceCompany", "cardinality": ""}


## GreenCard "1..*" --> "1..1" ThirdPartyInsurance : proves insurance
Text: Green Card means an international certificate proving that the road vehicle has been covered by a third party insurance contract for the road vehicle specified in the certificate.

Output:
- {"name": "proves insurance", "inference": "Green Card means a certificate proving that the road vehicle has been covered by a third party insurance contract", "source_entity": "GreenCard", "target_entity": "ThirdPartyInsurance", "cardinality": "1..* --> 1..1"}


## GreenCard "1..*" --> "1..1" RoadVehicle : specifies
Text: Green Card means an international certificate proving that the road vehicle has been covered by a third party insurance contract for the road vehicle specified in the certificate.


Output:
- {"name": "specifies", "inference": "Green Card means an international certificate ... for the road vehicle specified in the certificate", "source_entity": "GreenCard", "target_entity": "RoadVehicle", "cardinality": "1..1 --> 1..1"}


## MotorisedVehicle "1..1" --> "1..1" Engine : powered by
Text: In addition, for a road vehicle it is stated:
- the engine data for the road vehicle that include the type of engine specified by the manufacturer of the road vehicle, the engine power specified by the road vehicle manufacturer in kW/rpm in the case of an internal combustion engine or in kW in the case of other engines, the displacement of the internal combustion engine as specified by the manufacturer of the road vehicle in cm3; and the fuel type of the road vehicle

Output:
- {"name": "powered by", "inference": "for a road vehicle it is stated: the engine power specified by the road vehicle", "source_entity": "MotorisedVehicle", "target_entity": "Engine", "cardinality": "1..1 --> 1..1"}


##  CombustionEngine --|> Engine
Text: In addition, for a road vehicle it is stated:
- the engine data for the road vehicle that include the type of engine specified by the manufacturer of the road vehicle, the engine power specified by the road vehicle manufacturer in kW/rpm in the case of an internal combustion engine or in kW in the case of other engines, the displacement of the internal combustion engine as specified by the manufacturer of the road vehicle in cm3; and the fuel type of the road vehicle

Output:
- {"name": "is-a", "inference": "engine power specified by the road vehicle manufacturer in kW/rpm in the case of an internal combustion engine or in kW in the case of other engines", "source_entity": "InternalCombustionEngine", "target_entity": "Engine", "cardinality": "1..1 --> 1..1"}


## MotorisedVehicle "1..1" --> "1..1" Bodywork : has bodywork
Text: In addition, for a motorised vehicle it is stated:
...
- type, serial number and colour of bodywork, number of seats and standing places or beds, dimensions of the loading area, volume of the box or tank,

Output:
- {"name": "has body work", "inference": "for a motorised vehicle it is stated: ... type, serial number and colour of bodywork", "source_entity": "MotorisedVehicle", "target_entity": "Bodywork", "cardinality": "1..1 --> 1..1"}


## TechnicalInspection "1..*" --> "1..1" TechnicalInspectionStation : carried out by
Text: A technical inspection station is a workplace specialised in carrying out technical inspections of road vehicles.

Output:
- {"name": "carried out by", "inference": "technical inspection station is a workplace specialised in carrying out technical inspections", "source_entity": "TechnicalInspection", "target_entity": "TechnicalInspectionStation", "cardinality": "1..* --> 1..1"}


## RoadVehicle "1..1" --> "0..*" TechnicalInspection : roadworthiness inspected by
Text: A road vehicle technical inspection is an inspection of its roadworthiness which includes the technical condition and functioning of a road vehicle, its systems, components and separate technical units and their environmental impact or a registration test of a road vehicle.

Output:
- {"name": "roadworthiness inspected by", "inference": "road vehicle technical inspection is an inspection of its roadworthiness", "source_entity": "RoadVehicle", "target_entity": "TechnicalInspection", "cardinality": "1..1 --> 0..*"}


## RoadVehicle "0..1" --> "0..*" ReportOnRoadworthiness : roadworthiness approved by
Text: A road vehicle technical inspection is an inspection of its roadworthiness which includes the technical condition and functioning of a road vehicle, its systems, components and separate technical units and their environmental impact or a registration test of a road vehicle. On the basis of the defect record, the technical inspection station shall draw up a technical inspection report on the technical inspection of the road vehicle and hand it over to the natural person who delivered the vehicle for the technical inspection. A road vehicle is technically fit for use on the road if no defects or only minor defects have been found during the road vehicle inspection.

Output:
- {"name": "roadworthiness approved by", "inference": "road vehicle technical inspection is an inspection of its roadworthiness ... technical inspection station shall draw up a technical inspection report on the technical inspection of the road vehicle", "source_entity": "RoadVehicle", "target_entity": "ReportOnRoadworthiness", "cardinality": "0..1 --> 0..*"}


## RoadVehicle "0..1" --> "0..*" ReportOnTechnicalUnfittness : technical unfittness detected by
Text: If a technical inspection reveals a serious defect, the road vehicle is technically fit for use only for 30 days from the date of issue of the technical inspection report. ... if the repeated technical inspection reveals that the defect to be rectified has been recurrently rectified, the road vehicle is technically unfit for use and may not be used in traffic

Output:
- {"name": "technical unfittness detected by", "inference": "technical inspection reveals ... defect ... technical inspection report ... the road vehicle is technically unfit for use", "source_entity": "RoadVehicle", "target_entity": "ReportOnTechnicalUnfittness", "cardinality": "0..1 --> 0..*"}


## MinorDefect --|> Defect
Text: The technical inspection of a road vehicle can detect 3 levels of defects, which are
- a minor defect which does not significantly affect the operational characteristics of the road vehicle, road safety or the environment,

Output:
- {"name": "is-a", "inference": "3 levels of defects, which are ... a minor defect", "source_entity": "MinorDefect", "target_entity": "Defect", "cardinality": ""}


## SeriousDefect --|> Defect
Text: The technical inspection of a road vehicle can detect 3 levels of defects, which are
...
- a serious defect which affects the operational characteristics of the road vehicle, is liable to endanger road traffic, may adversely affect the environment or consists of a serious deficiency in the identification of the road vehicle, or

Output:
- {"name": "is-a", "inference": "3 levels of defects, which are ... a serious defect", "source_entity": "SeriousDefect", "target_entity": "Defect", "cardinality": ""}


## DangerousDefect --|> Defect
Text: The technical inspection of a road vehicle can detect 3 levels of defects, which are
...
- a dangerous defect which poses an immediate threat to the safety of the road vehicle, to road traffic or to the environment.

Output:
- {"name": "is-a", "inference": "3 levels of defects, which are ... a dangerous defect", "source_entity": "DangerousDefect", "target_entity": "Defect", "cardinality": ""}


## TechnicalInspection "1..1" --> "1..1" TechnicalInspectionReport : reported in
Text: On the basis of the defect record, the technical inspection station shall draw up a technical inspection report on the technical inspection of the road vehicle and hand it over to the natural person who delivered the road vehicle for the technical inspection.

Output:
- {"name": "reported in", "inference": "technical inspection station shall draw up a technical inspection report on the technical inspection", "source_entity": "TechnicalInspection", "target_entity": "TechnicalInspectionReport", "cardinality": "1..1 --> 1..1"}


## TechnicalInspectionReport "0..*" --> "0..*" Defect : reports on
Text: On the basis of the defect record, the technical inspection station shall draw up a technical inspection report on the technical inspection of the road vehicle and hand it over to the natural person who delivered the road vehicle for the technical inspection.

Output:
- {"name": "reports on", "inference": "On the basis of the defect record, the technical inspection station shall draw up a technical inspection report on the technical inspection of the road vehicle", "source_entity": "TechnicalInspectionReport", "target_entity": "Defect", "cardinality": "0..* --> 0..*"}


## TechnicalInspection "0..*" --> "0..*" Defect : detects
Text: On the basis of the defect record, the technical inspection station shall draw up a technical inspection report on the technical inspection of the road vehicle and hand it over to the natural person who delivered the road vehicle for the technical inspection. ... If the technical inspection has revealed minor defects, the operator of the road vehicle shall remedy them.

Output:
- {"name": "detects", "inference": "On the basis of the defect record, the technical inspection station shall draw up a technical inspection report on the technical inspection of the road vehicle ... If the technical inspection has revealed minor defects", "source_entity": "TechnicalInspectionReport", "target_entity": "Defect", "cardinality": "0..* --> 0..*"}


## TechnicalInspectionReport "0..*" --> "1..*" SeriousDefect : reports on
Text: On the basis of the defect record, the technical inspection station shall draw up a technical inspection report on the technical inspection of the road vehicle and hand it over to the natural person who delivered the road vehicle for the technical inspection. ... If a technical inspection reveals a serious defect, the vehicle is technically fit for use only for 30 days from the date of issue of the technical inspection report.

Output:
- {"name": "reports on", "inference": "On the basis of the defect record, the technical inspection station shall draw up a technical inspection report on the technical inspection of the road vehicle ... If a technical inspection reveals a serious defect", "source_entity": "TechnicalInspectionReport", "target_entity": "SeriousDefect", "cardinality": "0..* --> 1..*"}


## TechnicalInspectionReport "0..*" --> "1..*" DangerousDefect : reports on
Text: On the basis of the defect record, the technical inspection station shall draw up a technical inspection report on the technical inspection of the road vehicle and hand it over to the natural person who delivered the road vehicle for the technical inspection. ... If the technical inspection of a road vehicle reveals a dangerous defect, the road vehicle is technically unfit for use and must not be used in traffic.

Output:
- {"name": "reports on", "inference": "On the basis of the defect record, the technical inspection station shall draw up a technical inspection report on the technical inspection of the road vehicle ... If the technical inspection of a road vehicle reveals a dangerous defect", "source_entity": "TechnicalInspectionReport", "target_entity": "DangerousDefect", "cardinality": "0..* --> 1..*"}


## ReportOnRoadworthiness --|> TechnicalInspectionReport
Text: A road vehicle technical inspection is an inspection of its roadworthiness which includes the technical condition and functioning of a road vehicle, its systems, components and separate technical units and their environmental impact or a registration test of a road vehicle. On the basis of the defect record, the technical inspection station shall draw up a technical inspection report on the technical inspection of the road vehicle and hand it over to the natural person who delivered the road vehicle for the technical inspection.

Output:
- {"name": "is-a", "inference": "road vehicle technical inspection is an inspection of its roadworthiness ... technical inspection station shall draw up a technical inspection report on the technical inspection of the road vehicle", "source_entity": "ReportOnRoadworthiness", "target_entity": "TechnicalInspectionReport", "cardinality": ""}


## ReportOnLimitedRoadworthiness --|> TechnicalInspectionReport
Text: A road vehicle technical inspection is an inspection of its roadworthiness which includes the technical condition and functioning of a road vehicle, its systems, components and separate technical units and their environmental impact or a registration test of a road vehicle. On the basis of the defect record, the technical inspection station shall draw up a technical inspection report on the technical inspection of the road vehicle and hand it over to the natural person who delivered the road vehicle for the technical inspection. If a technical inspection reveals a serious defect, the vehicle is technically fit for use only for 30 days from the date of issue of the technical inspection report.

Output:
- {"name": "is-a", "inference": "road vehicle technical inspection is an inspection of its roadworthiness ... technical inspection station shall draw up a technical inspection report on the technical inspection of the road vehicle", "source_entity": "ReportOnLimitedRoadworthiness", "target_entity": "TechnicalInspectionReport", "cardinality": ""}


## TechnicalInspectionStationOperator --|> Person
Text: If the person is a natural person. ... A technical inspection station may be operated by a legal or natural person who has a licence to operate it and a certificate issued by the regional authority.

Output:
- {"name": "is-a", "inference": "If the person is a natural person ... technical inspection station may be operated by a legal or natural person", "source_entity": "TechnicalInspectionStationOperator", "target_entity": "Person", "cardinality": ""}