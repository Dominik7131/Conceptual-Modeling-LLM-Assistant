# Dataset

Some examples consist of more than one description. This is denoted by letters a), b), c) etc.


## 1) School

### 1a)
One or more professors can teach any number of courses. Five or more students can be part of any number of courses. One to four students can be part of a Dormitory unit. Each professor and student has a name. Courses have a name and number of credits. Each dormitory unit has a price.

### 1b)
We know that courses have a name and a specific number of credits. Each course can have one or more professors, who have a name. Professors could participate in any number of courses. For a course to exist, it must aggregate, at least, five students, where each student has a name. Students can be enrolled in any number of courses. Finally, students can be accommodated in dormitories, where each dormitory can have from one to four students. Besides, each dormitory has a price.

### 1c)
Please build a diagram that represents Professors and Students. They both have a name. There are also courses, which are taught by one or more professors, and are taken by five or more students. Each course has a name and a number of credits. Finally, Dormitory units can host between 1 and 4 students. Each Dormitory unit has a price.

![school](images/School.png)


## 2) Car

### 2a)
A car make has a name, and it can have several models (each model has a name). For each model, there can be any number of cars, where each car has a plate number. Every car can have any number of seats, where each seat has a size. Also, all cars have 4 wheels, and each wheel has a diameter. Finally, all cars have one engine, where each engine has a specific power.

### 2b)
Represent cars. Cars belong to models, which in turn belong to makes. Each car has four wheels, one engine and a set of seats. Every make and model have a unique name. Each wheel has a diameter, which must be the same for all wheels of the same car. Each engine has a certain 
power. Likewise, the seats have a size, which must be the same for all the seats of the cars of the same model. 
Each car has a number plate that identifies it.

![car](images/Car.png)


## 3) Video store

### 3a)
Video store has multiple clients and these clients can rent many movies. Video store, clients and movies have a name.

### 3b)
We are modeling a video store. There are also clients and movies in the system, all of which have a name. Video stores rent out movies, where the same movie can be offered in any video store. Video stores have clients.

### 3c)
Please build a diagram that represents video stores. Video stores rent movies and have clients. All entities (video stores, clients and movies) have names. Please include in the diagram the multiplicities of all associations.

![video_store](images/VideoStore.png)



## 4) Airline

### 4a)
Any number of airlines operates in any number of airports. The relation between airport and airline contains a details class with the operating cost. Each airline has a name and each airport has a code and city.

### 4b)
Many different airlines can operate in different airports. An airline has a name, and an airport has a code and is in a city. Each airline has associated a cost for operating in a specific airport. Besides, the operation of an airline in a specific airport can be started and stopped at any time, and its operating cost can be updated at any time.

### 4c)
Please build a diagram that represents Airlines that operate in Airports. The details of every airline operation include the operating costs, as well as methods to start and stop the operation, and to update the operating cost. Airports have a code and are placed in a city.

![airline](images/Airline.png)


## 5) File system

### 5a)
We have file system elements, which can be a folder and a file. All file system elements have a name. Every file system element 
must belong to a folder, and folders can aggregate any number of file system elements. Files have 
information about their extension and their size.

### 5b)
Please build diagram that represents file system elements, which can be files or folders. All file system elements have a name. Moreover, files have an extension and a size. Folders may contain other file system elements.

![file_system](images/FileSystem.png)


## 6) Computer information system
We want to design information system which contains computers. We will have available three entities: Computer, Producer and Service. At each computer we are interested in it's ID, memory size in gigabytes, number of threads and ID of his producer. Producer has ID and a name. Service has a name. Each computer has exactly one producer and one producer could have made a multiple computers. Each computer executes arbitrary number of services and each service can run on multiple computers.

(Original text in Czech: Chceme navrhnout informační systém, který obsahuje počítače. K dispozici budeme mít 3 třídy: Computer (počítač), Producer (výrobce) a Service (služba). U Každého počítače nás zajímá ID, velikost RAM v gigabytech, počet vláken a ID jeho výrobce. U výrobce si chceme pamatovat jeho ID a název, u služeb nám postačí název. Každý počítač má právě jednoho výrobce a jeden výrobce mohl vyrobit několik počítačů. Každý počítač provozuje libovolný počet služeb a každá služba může běžet na více počítačích.)

![computer_information_system](images/ComputerIS.jpg)


## 7) Amusement park
We have four classes: Boss, Employee, Attraction and Visitor. Each employee has exactly one boss and a boss manages at least one employee. Each employee is monitoring at least one attraction and likewise each attraction is monitored by at least one employee. Each visitor is visiting at least one attraction and each attraction is visited by arbitrary number of visitors. For each boss we know their ID and a name. For each employee we know their ID, ID of their boss, name and salary. For each attraction we know their ID and a name. For each visitor we know their name, gender and age.

![amusement_park](images/AmusementPark.png)


## 8) IT database
Model an IT database. We mostly want to model computers and software equipment. Computers can be either real or virtual running on a real computer. On one real computer can run multiple virtual computers. Eeach computer has it's name, size of memory and number of threads. Computers can offer services (email, DNS, WWW, ...). On each computer runs one given operating system and there can be installed another software. For each software we need to know it'S name, producent and a version.

(Original text in Czech: Evidují se především počítače a softwarové vybavení. Počítače mohou být buďto skutečné, nebo virtuální, běžící na skutečném počítači. Na jednom skutečném počítači může běžet několik počítačů virtuálních. Každý počítač má své jméno, velikost paměti a počet jader. Počítače mohou poskytovat služby (email, DNS, WWW, ...). Na každém počítači běží jeden daný operační systém, a může na něm být nainstalovaný další software. U softwaru je důležité znát název, výrobce a verzi.)

![IT_database](images/IT-DatabaseEN.jpg)