# Přesné vymezení zadání

## Všechny doteď zmiňované featury LLM asistenta

### 1. Navrhování atributů/asociací/entit
- pro každý atribut LLM navrhne:
	- název
	- datový typ
	- popis, pokud nemá na vstupu popis domény
	- inferenci, pokud má na vstupu popis domény

<br />

- pro každou asociaci LLM navrhne:
	- název
	- zdrojovou entitu
	- cílovou entitu
	- popis, pokud nemá na vstupu popis domény
	- inferenci, pokud má na vstupu popis domény

<br />

- pro každou entitu LLM navrhne:
	- název

<br />
<br />

- když uživatel ve svém konceptuálním modelu:
	- a) nic neoznačí
		- LLM umí navrhnout entity čistě na základě popisu domény

	- b) označí jednu entitu
		- LLM umí pro ni navrhnout atributy, nebo asociace bez popisu domény
		- LLM umí pro ni navrhnout atributy, nebo asociace čistě na základě popisu domény

	- c) označí dvě entity
		- LLM umí pro ně navrhnout asociace bez popisu domény
		- LLM umí pro ně navrhnout asociace čistě na základě popisu domény

	- d) označí část popisu domény
		- LLM umí v této vyznačené části najít atributy/asociace/entity

	- e) nic neoznačí, ale zadá instrukci do odděleného textového pole od popisu domény
		- Př.: Studenti pracují na diplomkách
		- LLM umí navrhnout takový seznam atributů, asociací a entit, které čistě na základě popisu domény povedou k vykonání požadované instrukce

	- f) nic neoznačí, ale zvolí možnost autopilota
		- LLM navrhne konceptuální model pro zadaný popis domény bez uživatelovy pomoci

<br />
<br />

#### Frontend
- každý návrh atributu/asociace/entity lze:
	- I) přidat do uživatelova konceptuálního modelu (pokud je návrh složitější, tak provést sloučení s již existujícím uživatelovým konceptuálním modelem)
	- II) upravit (lze změnit každou navrhovanou část)
	- III) v expertním režimu označit za relevantní pro případný fine-tuning LLM

- jakým způsobem navrhovat atributy/asociace/entity:
	- a) sidebar, ve kterém zobrazíme všechny návrhy
	- b) sidebar, ale když bude návrh obsahovat inferenci, tak v popisu domény zvýrazníme odpovídající část textu, na kterou když najedeme myší, tak se zobrazí příslušný návrh
		- Př.: entity vždy budeme ukazovat mimo ten popis domény, protože nikdy nebudou mít inferenci
		- potom bude otázka, jestli nepřidat nějakou možnost filtrování těch označených částí (Př.: možnost nechat ukázat zvýrazněné části pouze pro návrhy atributů), abychom nezahlcovali uživatele hodně různými návrhy

- pokud LLM bude umět generovat složitější návrhy (= návrhy obsahující více než právě jeden atribut, nebo právě jednu asociaci, nebo právě jednu entitu), tak jakým způsobem je zobrazit:
	- jako pro jednoduchý návrh, jenom v nějakém boxu pod sebou bude vyjmenováno více věcí, kde ten box bude vyznačovat, co patří k jednomu příslušnému návrhu
	- konceptuální model zachycující změny

<br />
<br />

### 2. Textový popis

- předpoklad: uživatel označí část konceptuálního modelu

- a) LLM umí vytvořit dokumentační popisky ke každému atributu/asociaci
	- každý popisek nejdřív uživatel bude muset potvrdit, že je v pořádku
		- jinak bude mít možnost popisek buď odebrat, nebo zeditovat
	- I) LLM nebude mít na vstupu popis domény
	- II) LLM bude mít na vstupu popis domény

- b) LLM umí provést nestrukturované shrnutí
	- pokud je používán popis domény, tak ve výchozím nastavení je výstup v míře detailů odpovídající popisu domény
	- pokud není používán popis domény, tak výstup bude podle nějakého výchozího nastavení

- pro libovolný automaticky generovaný text možnost nechat uživatele nastavit některé parametry:
	- I) formalita: neformální, neutrální, formální
	- II) doména: akademická, obecná, casual, atd.


<br />
<br />

### 3. Zvýraznění již namodelované části v popisu domény

- a) když uživatel označí část konceptuálního modelu
	- tak atributy/asociace, které mají inferenci, jsou zvýrazněny v popisu domény
	- ostatní části jsou poslány LLM s popisem domény pro pokus o zisk inference
		- pokud v popisu domény nejsou, tak uživatel bude mít možnost si nechat tu část popisu domény vygenerovat přes featuru 2b)

<br />
<br />

#### Frontend
- možnost zapnout automatické zvýrazňování v popisu domény všech atributů a asociací:
	- I) které mají inferenci
	- II) které mají inferenci a zároveň je má uživatel označené

- když myší najedeme na libovolnou zvýrazněnou část, tak ukázat tooltip obsahující název entity a název příslušného atributu/asociace

<br />
<br />

## Ostatní věci

Jaký typ vstupu budeme zvládat:
- a) uživatel ručně vloží text do nějakého předem daného textového pole
- b) + navíc možnost nahrát do textového pole obsah obyčejného textového souboru
- c) + navíc možnost nahrát do textového pole obsah souboru ve formátu PDF (případně v jiném formátu)

<br />
<br />

Jaký formát popisu domény bude zvládat:
- a) text ve větách
- b) seznam bodů (Př.: školní řád)
- c) obrázky, nebo jiné formáty?

<br />
<br />

Jak reagovat na editování popisu domény:
- a) nijak
- b) zkusit automaticky aktualizovat inference (ale to by mohlo trvat dlouho)
- c) možná zkontrolovat, jestli ten popis domény není víceznačný, nebo jestli si některé části neprotiřečí
- d) zkusit detekovat části textu, které nepopisují tu doménu
- e) nějaký jiný způsob?