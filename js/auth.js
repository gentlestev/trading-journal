// ============================================================
// FSH Empire — Auth: Login, register, Google OAuth, validation, country data
// ============================================================

import { sb, setCurrentUser, allTrades, setAllTrades, derivWS, derivToken, setDerivToken } from './app.js';
import { showToast } from './ui.js';

function switchAuthTab(tab){
  document.querySelectorAll('.auth-tab').forEach((t,i)=>t.classList.toggle('active',(i===0&&tab==='login')||(i===1&&tab==='register')));
  document.getElementById('loginForm').style.display=tab==='login'?'flex':'none';
  document.getElementById('registerForm').style.display=tab==='register'?'flex':'none';
}

async function signInWithGoogle(){
  const{error}=await sb.auth.signInWithOAuth({
    provider:'google',
    options:{redirectTo:'https://gentlestev.github.io/trading-journal'}
  });
  if(error)showToast('Google sign-in error: '+error.message,true);
}



// ── ALLOWED EMAIL PROVIDERS (standard only, no temp/disposable) ──
const ALLOWED_EMAIL_DOMAINS = [
  'gmail.com','yahoo.com','yahoo.co.uk','yahoo.ca','yahoo.com.au','yahoo.co.in',
  'outlook.com','hotmail.com','hotmail.co.uk','hotmail.ca','live.com','live.co.uk',
  'msn.com','icloud.com','me.com','mac.com','protonmail.com','proton.me',
  'aol.com','zoho.com','yandex.com','yandex.ru','gmx.com','gmx.net',
  'mail.com','tutanota.com','fastmail.com','fastmail.fm','hey.com',
  // Nigerian providers
  'yahoo.com.ng','gmail.com.ng',
  // Canadian providers  
  'shaw.ca','rogers.com','bell.net','telus.net','sympatico.ca','videotron.ca',
  // UK providers
  'btinternet.com','sky.com','talktalk.net','virginmedia.com','tiscali.co.uk',
  // Work/edu - allow common patterns
  'edu','ac.uk','gov','org'
];

// Disposable/temp email domains to block
const BLOCKED_DOMAINS = [
  'mailinator.com','guerrillamail.com','tempmail.com','throwaway.email',
  'yopmail.com','sharklasers.com','guerrillamailblock.com','grr.la',
  'guerrillamail.info','spam4.me','trashmail.com','trashmail.me',
  'dispostable.com','mailnull.com','spamgourmet.com','spamgourmet.net',
  'tempr.email','discard.email','maildrop.cc','harakirimail.com',
  'fakeinbox.com','tempinbox.com','spambox.us','mailexpire.com',
  'temporarymail.com','throwam.com','spamfree24.org','mailnew.com',
  '10minutemail.com','10minutemail.net','20minutemail.com','minutemail.com',
  'mytemp.email','temp-mail.org','tempmail.net','getnada.com','tnef.com',
  'mohmal.com','mailtemp.info','emailondeck.com','dispostable.com'
];

function validateEmail(email){
  const err = document.getElementById('regEmailError');
  if(!err) return true;
  err.style.display='none';
  
  if(!email || !email.includes('@')){
    err.textContent='Enter a valid email address.';
    err.style.display='block';
    document.getElementById('regEmail').className='form-input invalid';
    return false;
  }
  
  const domain = email.split('@')[1]?.toLowerCase();
  if(!domain){
    err.textContent='Enter a valid email address.';
    err.style.display='block';
    document.getElementById('regEmail').className='form-input invalid';
    return false;
  }

  // Block disposable
  if(BLOCKED_DOMAINS.includes(domain)){
    err.textContent='Temporary or disposable email addresses are not allowed.';
    err.style.display='block';
    document.getElementById('regEmail').className='form-input invalid';
    return false;
  }

  // Check allowed — must match known provider or have edu/gov/org/ac.uk suffix
  const isAllowed = ALLOWED_EMAIL_DOMAINS.some(d => domain === d || domain.endsWith('.'+d) || domain.endsWith('.edu') || domain.endsWith('.gov') || domain.endsWith('.org') || domain.endsWith('ac.uk'));
  if(!isAllowed){
    err.textContent='Please use a standard email provider (Gmail, Yahoo, Outlook, iCloud etc).';
    err.style.display='block';
    document.getElementById('regEmail').className='form-input invalid';
    return false;
  }

  document.getElementById('regEmail').className='form-input valid';
  err.style.display='none';
  return true;
}

// ── COUNTRIES WITH STATES AND CITIES ──
const COUNTRIES=[
  {name:"Nigeria",code:"NG",dial:"+234",postal:/^\d{6}$/,
   states:{
    "Abia":["Aba","Umuahia","Ohafia","Arochukwu","Bende"],
    "Adamawa":["Yola","Mubi","Jimeta","Numan","Ganye"],
    "Akwa Ibom":["Uyo","Eket","Ikot Ekpene","Oron","Abak"],
    "Anambra":["Awka","Onitsha","Nnewi","Ekwulobia","Aguata"],
    "Bauchi":["Bauchi","Azare","Misau","Katagum","Ningi"],
    "Bayelsa":["Yenagoa","Brass","Ogbia","Sagbama","Ekeremor"],
    "Benue":["Makurdi","Gboko","Katsina-Ala","Otukpo","Vandeikya"],
    "Borno":["Maiduguri","Biu","Gwoza","Bama","Dikwa"],
    "Cross River":["Calabar","Ogoja","Ikom","Obudu","Ugep"],
    "Delta":["Asaba","Warri","Sapele","Ughelli","Agbor"],
    "Ebonyi":["Abakaliki","Afikpo","Onueke","Ikwo","Ezza"],
    "Edo":["Benin City","Auchi","Ekpoma","Uromi","Igueben"],
    "Ekiti":["Ado-Ekiti","Ikere","Oye","Ijero","Efon"],
    "Enugu":["Enugu","Nsukka","Agbani","Oji River","Awgu"],
    "FCT":["Abuja","Gwagwalada","Kuje","Bwari","Kwali"],
    "Gombe":["Gombe","Kumo","Billiri","Kaltungo","Deba"],
    "Imo":["Owerri","Orlu","Okigwe","Mbaise","Oguta"],
    "Jigawa":["Dutse","Hadejia","Gumel","Kazaure","Birnin Kudu"],
    "Kaduna":["Kaduna","Zaria","Kafanchan","Kagoro","Saminaka"],
    "Kano":["Kano","Wudil","Gwarzo","Rano","Bebeji"],
    "Katsina":["Katsina","Daura","Funtua","Malumfashi","Mani"],
    "Kebbi":["Birnin Kebbi","Argungu","Yauri","Zuru","Jega"],
    "Kogi":["Lokoja","Okene","Idah","Ankpa","Kabba"],
    "Kwara":["Ilorin","Offa","Patigi","Kaiama","Lafiagi"],
    "Lagos":["Lagos","Ikeja","Lekki","Victoria Island","Surulere","Yaba","Badagry","Epe","Ikorodu","Mushin"],
    "Nasarawa":["Lafia","Keffi","Akwanga","Nasarawa","Doma"],
    "Niger":["Minna","Bida","Suleja","Kontagora","Lapai"],
    "Ogun":["Abeokuta","Sagamu","Ijebu-Ode","Ilaro","Ota"],
    "Ondo":["Akure","Ondo","Owo","Ikare","Okitipupa"],
    "Osun":["Osogbo","Ile-Ife","Ilesa","Ede","Ikirun"],
    "Oyo":["Ibadan","Ogbomoso","Oyo","Iseyin","Saki"],
    "Plateau":["Jos","Bukuru","Shendam","Pankshin","Wase"],
    "Rivers":["Port Harcourt","Bonny","Degema","Ahoada","Omoku"],
    "Sokoto":["Sokoto","Tambuwal","Gwadabawa","Illela","Isa"],
    "Taraba":["Jalingo","Wukari","Bali","Sardauna","Zing"],
    "Yobe":["Damaturu","Nguru","Potiskum","Geidam","Gashua"],
    "Zamfara":["Gusau","Kaura Namoda","Talata Mafara","Anka","Bakura"]
   }},
  {name:"Canada",code:"CA",dial:"+1",postal:/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
   states:{
    "Alberta":["Calgary","Edmonton","Red Deer","Lethbridge","St. Albert","Medicine Hat","Grande Prairie","Airdrie","Spruce Grove","Leduc"],
    "British Columbia":["Vancouver","Victoria","Kelowna","Abbotsford","Kamloops","Nanaimo","Chilliwack","Prince George","Surrey","Burnaby"],
    "Manitoba":["Winnipeg","Brandon","Steinbach","Thompson","Portage la Prairie","Winkler","Selkirk","Morden","Dauphin","The Pas"],
    "New Brunswick":["Fredericton","Moncton","Saint John","Bathurst","Miramichi","Edmundston","Campbellton","Dieppe","Riverview","Quispamsis"],
    "Newfoundland":["St. John's","Mount Pearl","Corner Brook","Conception Bay South","Grand Falls-Windsor","Gander","Happy Valley","Labrador City","Stephenville","Marystown"],
    "Northwest Territories":["Yellowknife","Hay River","Inuvik","Fort Smith","Behchoko"],
    "Nova Scotia":["Halifax","Sydney","Truro","New Glasgow","Glace Bay","Dartmouth","Bridgewater","Amherst","Antigonish","Kentville"],
    "Nunavut":["Iqaluit","Rankin Inlet","Arviat","Baker Lake","Cambridge Bay"],
    "Ontario":["Toronto","Ottawa","Mississauga","Brampton","Hamilton","London","Markham","Vaughan","Kitchener","Windsor","Barrie","Orillia","Sudbury","Thunder Bay","Kingston","Guelph","Burlington","Oshawa","Waterloo","Cambridge"],
    "Prince Edward Island":["Charlottetown","Summerside","Stratford","Cornwall","Montague"],
    "Quebec":["Montreal","Quebec City","Laval","Gatineau","Longueuil","Sherbrooke","Saguenay","Levis","Trois-Rivieres","Terrebonne"],
    "Saskatchewan":["Saskatoon","Regina","Prince Albert","Moose Jaw","Swift Current","Yorkton","North Battleford","Estevan","Weyburn","Lloydminster"],
    "Yukon":["Whitehorse","Dawson City","Watson Lake","Haines Junction","Carmacks"]
   }},
  {name:"United States",code:"US",dial:"+1",postal:/^\d{5}(-\d{4})?$/,
   states:{
    "California":["Los Angeles","San Francisco","San Diego","Sacramento","San Jose","Fresno","Long Beach","Oakland","Bakersfield","Anaheim"],
    "Texas":["Houston","San Antonio","Dallas","Austin","Fort Worth","El Paso","Arlington","Corpus Christi","Plano","Laredo"],
    "Florida":["Jacksonville","Miami","Tampa","Orlando","St. Petersburg","Hialeah","Tallahassee","Fort Lauderdale","Port St. Lucie","Cape Coral"],
    "New York":["New York City","Buffalo","Rochester","Yonkers","Syracuse","Albany","New Rochelle","Mount Vernon","Schenectady","Utica"],
    "Illinois":["Chicago","Aurora","Rockford","Joliet","Naperville","Springfield","Peoria","Elgin","Waukegan","Cicero"],
    "Pennsylvania":["Philadelphia","Pittsburgh","Allentown","Erie","Reading","Scranton","Bethlehem","Lancaster","Harrisburg","York"],
    "Ohio":["Columbus","Cleveland","Cincinnati","Toledo","Akron","Dayton","Parma","Canton","Youngstown","Lorain"],
    "Georgia":["Atlanta","Augusta","Columbus","Macon","Savannah","Athens","Sandy Springs","Roswell","Johns Creek","Albany"],
    "North Carolina":["Charlotte","Raleigh","Greensboro","Durham","Winston-Salem","Fayetteville","Cary","Wilmington","High Point","Concord"],
    "Michigan":["Detroit","Grand Rapids","Warren","Sterling Heights","Ann Arbor","Lansing","Flint","Dearborn","Livonia","Clinton"],
    "Other US State":["Major City","Other City"]
   }},
  {name:"United Kingdom",code:"GB",dial:"+44",postal:/^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i,
   states:{
    "England":["London","Birmingham","Manchester","Leeds","Liverpool","Sheffield","Bristol","Newcastle","Nottingham","Leicester","Coventry","Bradford","Stoke","Southampton","Portsmouth","Reading","Derby","Wolverhampton","Plymouth","Luton"],
    "Scotland":["Glasgow","Edinburgh","Aberdeen","Dundee","Inverness","Perth","Stirling","Livingston","Dunfermline","Kilmarnock"],
    "Wales":["Cardiff","Swansea","Newport","Bangor","Wrexham","Barry","Pontypridd","Neath","Bridgend","Cwmbran"],
    "Northern Ireland":["Belfast","Derry","Lisburn","Newry","Armagh","Ballymena","Bangor","Newtownabbey","Carrickfergus","Craigavon"]
   }},
  {name:"Ghana",code:"GH",dial:"+233",postal:/^\d{5}$/,
   states:{
    "Greater Accra":["Accra","Tema","Ashaiman","Madina","Teshie","Nungua","Dome","Achimota","Adenta","Kasoa"],
    "Ashanti":["Kumasi","Obuasi","Ejisu","Konongo","Mampong","Bekwai","Juaben","Agogo","Ashanti Mampong","Kumasi"],
    "Western":["Sekondi-Takoradi","Tarkwa","Prestea","Sefwi Wiawso","Bibiani","Ahanta West","Nkroful","Axim","Elubo","Daboase"],
    "Central":["Cape Coast","Winneba","Kasoa","Agona Swedru","Saltpond","Mankessim","Elmina","Assin Fosu","Dunkwa","Asikuma"],
    "Eastern":["Koforidua","Nkawkaw","Suhum","Akim Oda","Somanya","Aburi","Nsawam","Akropong","Begoro","Akim Tafo"],
    "Northern":["Tamale","Yendi","Bimbilla","Savelugu","Gushegu","Tolon","Kumbungu","Karaga","Zabzugu","Tatale"],
    "Volta":["Ho","Hohoe","Keta","Kpando","Aflao","Sogakope","Akatsi","Denu","Anloga","Battor"],
    "Brong-Ahafo":["Sunyani","Berekum","Techiman","Wenchi","Kintampo","Dormaa Ahenkro","Nkoranza","Atebubu","Prang","Bechem"],
    "Upper East":["Bolgatanga","Bawku","Navrongo","Zebilla","Sandema","Paga","Bongo","Fumbisi","Tongo","Nangodi"],
    "Upper West":["Wa","Lawra","Tumu","Nandom","Jirapa","Kaleo","Funsi","Wechiau","Babile","Daffiama"]
   }},
  {name:"Kenya",code:"KE",dial:"+254",postal:/^\d{5}$/,
   states:{
    "Nairobi":["Nairobi CBD","Westlands","Karen","Kibera","Kasarani","Embakasi","Langata","Dagoretti","Makadara","Starehe"],
    "Mombasa":["Mombasa Island","Nyali","Bamburi","Kisauni","Likoni","Changamwe","Jomvu","Mikindani","Port Reitz","Tudor"],
    "Kisumu":["Kisumu Central","Kisumu East","Kisumu West","Seme","Muhoroni","Nyando","Nyakach","Kasipul","Kabondo","Karachuonyo"],
    "Nakuru":["Nakuru Town","Naivasha","Gilgil","Molo","Njoro","Rongai","Subukia","Bahati","Kuresoi","Ravine"],
    "Eldoret":["Eldoret Town","Turbo","Moiben","Ainabkoi","Kapseret","Kesses","Soy","Wareng","Marakwet East","Marakwet West"]
   }},
  {name:"South Africa",code:"ZA",dial:"+27",postal:/^\d{4}$/,
   states:{
    "Gauteng":["Johannesburg","Pretoria","Soweto","Benoni","Boksburg","Tembisa","Vereeniging","Randburg","Sandton","Midrand"],
    "Western Cape":["Cape Town","Stellenbosch","George","Paarl","Worcester","Knysna","Mossel Bay","Hermanus","Somerset West","Bellville"],
    "KwaZulu-Natal":["Durban","Pietermaritzburg","Richards Bay","Newcastle","Pinetown","Umlazi","Chatsworth","Phoenix","Tongaat","Stanger"],
    "Eastern Cape":["Port Elizabeth","East London","Mthatha","Queenstown","King William's Town","Bhisho","Grahamstown","Uitenhage","Graaff-Reinet","Cradock"],
    "Limpopo":["Polokwane","Tzaneen","Thohoyandou","Mokopane","Bela-Bela","Giyani","Phalaborwa","Louis Trichardt","Burgersfort","Lebowakgomo"]
   }},
  {name:"Australia",code:"AU",dial:"+61",postal:/^\d{4}$/,
   states:{
    "New South Wales":["Sydney","Newcastle","Wollongong","Maitland","Coffs Harbour","Wagga Wagga","Albury","Port Macquarie","Tamworth","Orange"],
    "Victoria":["Melbourne","Geelong","Ballarat","Bendigo","Shepparton","Melton","Mildura","Wodonga","Sunbury","Traralgon"],
    "Queensland":["Brisbane","Gold Coast","Sunshine Coast","Townsville","Cairns","Toowoomba","Mackay","Rockhampton","Bundaberg","Hervey Bay"],
    "Western Australia":["Perth","Mandurah","Bunbury","Rockingham","Joondalup","Fremantle","Armadale","Midland","Cannington","Gosnells"],
    "South Australia":["Adelaide","Mount Gambier","Whyalla","Murray Bridge","Port Augusta","Gawler","Victor Harbor","Port Lincoln","Naracoorte","Kadina"]
   }},
  {name:"Jamaica",code:"JM",dial:"+1876",postal:/^(JM)?\w{3}\d{2}$/i,
   states:{
    "Kingston":["Kingston","Half Way Tree","New Kingston","Liguanea","Papine","Constant Spring","Barbican","Meadowbrook","Mona","August Town"],
    "Saint Andrew":["Cross Roads","Matilda's Corner","Stony Hill","Gordon Town","Bull Bay","Irish Town","Red Hills","Beverly Hills","Havendale","Jack's Hill"],
    "Saint James":["Montego Bay","Rose Hall","Ironshore","Anchovy","Cambridge","Catadupa","Adelphi","Flanker","Salt Spring","Bogue"],
    "Saint Catherine":["Spanish Town","Portmore","Old Harbour","Linstead","Bog Walk","Ewarton","Angels","Waterford","Gregory Park","Braeton"],
    "Clarendon":["May Pen","Chapelton","Lionel Town","Four Paths","Kellits","Frankfield","Rock River","Hayes","Toll Gate","Portland Cottage"]
   }},
  {name:"Trinidad and Tobago",code:"TT",dial:"+1868",postal:/^\d{6}$/,
   states:{
    "Port of Spain":["Port of Spain","Woodbrook","Newtown","St. Clair","Belmont","Laventille","St. James","Petit Valley","Diego Martin","Carenage"],
    "San Fernando":["San Fernando","Marabella","Gasparillo","Claxton Bay","Couva","Chaguanas","Freeport","Felicity","Longdenville","Endeavour"],
    "Tobago":["Scarborough","Crown Point","Buccoo","Plymouth","Speyside","Charlotteville","Roxborough","Castara","Parlatuvier","Moriah"]
   }},
  {name:"Zimbabwe",code:"ZW",dial:"+263",postal:/^\d{4}$/,
   states:{
    "Harare":["Harare CBD","Borrowdale","Avondale","Chitungwiza","Norton","Ruwa","Epworth","Budiriro","Highfield","Glen Norah"],
    "Bulawayo":["Bulawayo CBD","Pumula","Nkulumane","Tshabalala","Luveve","Cowdray Park","Emakhandeni","Lobengula","Makokoba","Mpopoma"],
    "Manicaland":["Mutare","Rusape","Chipinge","Chimanimani","Nyanga","Birchenough Bridge","Cashel","Odzi","Headlands","Juliasdale"]
   }},
  {name:"Other",code:"XX",dial:"+",postal:/./,states:{"Other":["Other City"]}}
];

function getCountry(name){return COUNTRIES.find(c=>c.name===name)||COUNTRIES[COUNTRIES.length-1];}

function populateCountries(){
  const sel=document.getElementById('regCountry');
  if(!sel)return;
  sel.innerHTML='<option value="">Select country...</option>'+
    COUNTRIES.map(c=>`<option value="${c.name}">${c.name}</option>`).join('');
}

function onCountryChange(){
  const c=getCountry(document.getElementById('regCountry').value);
  document.getElementById('regDial').value=c.dial;
  // Populate states
  const stSel=document.getElementById('regState');
  const states=Object.keys(c.states||{});
  stSel.innerHTML='<option value="">Select state/province...</option>'+
    states.map(s=>`<option value="${s}">${s}</option>`).join('');
  // Clear city and address
  const citySel=document.getElementById('regCity');
  citySel.innerHTML='<option value="">Select state first...</option>';
  document.getElementById('regPostal').value='';
  document.getElementById('postalHint').textContent='';
  document.getElementById('regAddress').value='';
}

function onStateChange(){
  const country=document.getElementById('regCountry').value;
  const state=document.getElementById('regState').value;
  const c=getCountry(country);
  const cities=(c.states&&c.states[state])||[];
  const citySel=document.getElementById('regCity');
  citySel.innerHTML='<option value="">Select city...</option>'+
    cities.map(city=>`<option value="${city}">${city}</option>`).join('');
}

function validatePhone(){
  const dial=document.getElementById('regDial').value;
  const num=document.getElementById('regPhone').value.trim();
  const el=document.getElementById('regPhone');
  const err=document.getElementById('phoneError');
  if(num.length<6||num.length>13||!/^\d+$/.test(num)){
    el.className='form-input invalid';
    err.textContent='Enter a valid phone number (digits only, 6-13 digits)';
    err.style.display='block';return false;
  }
  el.className='form-input valid';err.style.display='none';return true;
}

function validatePostal(){
  const country=document.getElementById('regCountry').value;
  const postal=document.getElementById('regPostal').value.trim();
  const el=document.getElementById('regPostal');
  const err=document.getElementById('postalError');
  const hint=document.getElementById('postalHint');
  if(!country){err.textContent='Select a country first';err.style.display='block';return false;}
  const c=getCountry(country);
  if(!c.postal.test(postal)){
    el.className='form-input invalid';
    err.textContent='Invalid postal/zip code for '+country;
    err.style.display='block';hint.textContent='';
    return false;
  }
  el.className='form-input valid';
  err.style.display='none';
  hint.textContent='✓ Valid format';hint.style.color='var(--green)';
  return true;
}

function validateAddress(){
  const addr=document.getElementById('regAddress').value.trim();
  const el=document.getElementById('regAddress');
  const err=document.getElementById('addressError');
  // Must have a number and at least one word (e.g. "12 Main Street")
  if(addr.length < 6 || !/\d/.test(addr) || addr.split(' ').length < 2){
    el.className='form-input invalid';
    err.textContent='Enter a valid street address including house/building number';
    err.style.display='block';return false;
  }
  el.className='form-input valid';err.style.display='none';return true;
}

async function regNextStep(){
  const name=document.getElementById('regName').value.trim();
  const email=document.getElementById('regEmail').value.trim();
  const pass=document.getElementById('regPassword').value;
  const confirm=document.getElementById('regConfirm').value;
  const err=document.getElementById('registerError');
  const btn=document.getElementById('regNextBtn');
  err.style.display='none';

  if(!name){err.textContent='Full name is required.';err.style.display='block';return;}
  if(!validateEmail(email)){return;}
  if(!pass||pass.length<6){err.textContent='Password must be at least 6 characters.';err.style.display='block';return;}
  if(pass!==confirm){err.textContent='Passwords do not match.';err.style.display='block';return;}

  // Check if email already exists in database
  btn.textContent='CHECKING...';btn.disabled=true;
  try{
    const{data,error}=await sb.rpc('email_exists',{check_email:email});
    if(error)throw error;
    if(data===true){
      err.textContent='⚠️ This email is already registered. Please sign in or use a different email.';
      err.style.display='block';
      document.getElementById('regEmail').className='form-input invalid';
      btn.textContent='NEXT — CONTACT DETAILS →';btn.disabled=false;
      return;
    }
  }catch(e){
    // If RPC fails, continue anyway — Supabase will catch duplicate on signup
    console.warn('Email check error:',e);
  }

  btn.textContent='NEXT — CONTACT DETAILS →';btn.disabled=false;
  document.getElementById('regStep1').classList.remove('active');
  document.getElementById('regStep2').classList.add('active');
  document.getElementById('sdot1').classList.remove('active');document.getElementById('sdot1').classList.add('done');
  document.getElementById('sdot2').classList.add('active');
  populateCountries();
}

function regPrevStep(){
  document.getElementById('regStep2').classList.remove('active');
  document.getElementById('regStep1').classList.add('active');
  document.getElementById('sdot2').classList.remove('active');
  document.getElementById('sdot1').classList.remove('done');document.getElementById('sdot1').classList.add('active');
}

async function doRegister(){
  const err=document.getElementById('registerError');
  const suc=document.getElementById('registerSuccess');
  err.style.display='none';suc.style.display='none';

  // Final email duplicate check before submitting
  const emailVal=document.getElementById('regEmail').value.trim();
  try{
    const{data:exists}=await sb.rpc('email_exists',{check_email:emailVal});
    if(exists===true){
      err.textContent='⚠️ This email is already registered. Please sign in or use a different email.';
      err.style.display='block';return;
    }
  }catch(e){console.warn('Final email check error:',e);}

  // Validate step 2 fields
  const country=document.getElementById('regCountry').value;
  const state=document.getElementById('regState').value;
  const city=document.getElementById('regCity').value;
  const address=document.getElementById('regAddress').value.trim();
  const postal=document.getElementById('regPostal').value.trim();
  const phone=document.getElementById('regPhone').value.trim();
  const dial=document.getElementById('regDial').value;

  if(!country||!state||!city){
    err.textContent='Please select country, state and city.';err.style.display='block';return;
  }
  if(!address||!postal||!phone){
    err.textContent='All fields are required.';err.style.display='block';return;
  }
  if(!validatePhone()){return;}
  if(!validatePostal()){return;}
  if(!validateAddress()){return;}

  const name=document.getElementById('regName').value.trim();
  const email=document.getElementById('regEmail').value.trim();
  const pass=document.getElementById('regPassword').value;
  const fullPhone=dial+phone;

  const btn=document.getElementById('registerBtn');btn.textContent='CREATING...';btn.disabled=true;
  const{data,error}=await sb.auth.signUp({
    email,password:pass,
    options:{data:{full_name:name,phone:fullPhone,country,state,city,address,postal_code:postal}}
  });
  if(error){
    btn.textContent='CREATE ACCOUNT';btn.disabled=false;
    if(error.message.includes('already registered')||error.message.includes('already exists')||error.message.includes('unique')){
      err.textContent='An account with this email already exists. Please sign in instead.';
    } else {
      err.textContent=error.message;
    }
    err.style.display='block';return;
  }

  // Save profile to profiles table
  if(data?.user){
    await sb.from('profiles').upsert({
      id:data.user.id,full_name:name,phone:fullPhone,
      country,state,city,address,postal_code:postal
    });
  }
  btn.textContent='CREATE ACCOUNT';btn.disabled=false;
  showCongratsScreen(name);
}

async function doLogin(){
  const email=document.getElementById('loginEmail').value.trim();
  const pass=document.getElementById('loginPassword').value;
  const err=document.getElementById('loginError');err.style.display='none';
  if(!email||!pass){err.textContent='Email and password are required.';err.style.display='block';return;}
  const btn=document.getElementById('loginBtn');btn.textContent='SIGNING IN...';btn.disabled=true;
  const{error}=await sb.auth.signInWithPassword({email,password:pass});
  btn.textContent='SIGN IN';btn.disabled=false;
  if(error){err.textContent=error.message;err.style.display='block';}
}

async function forgotPassword(){
  const email=prompt('Enter your email to receive a reset link:');
  if(!email)return;
  const{error}=await sb.auth.resetPasswordForEmail(email);
  if(error)showToast('Error: '+error.message,true);
  else showToast('✅ Reset link sent to your email!');
}

async function doLogout(){if(derivWS)derivWS.close();await sb.auth.signOut();}

function onLogin(user){
  setCurrentUser(user);
  document.getElementById('authScreen').style.display='none';
  document.getElementById('appScreen').style.display='block';
  const email=user.email||'';
  const name=user.user_metadata?.full_name||email;
  document.getElementById('userEmail').textContent=email;
  document.getElementById('userAvatar').textContent=(name[0]||'?').toUpperCase();
  document.getElementById('jDate').value=new Date().toISOString().split('T')[0];
  const saved=localStorage.getItem('dt_'+user.id);
  if(saved){setDerivToken(saved);connectDeriv(true);}
  loadTradesFromSupabase();
  // Boot to Deriv tab
  setTimeout(()=>{
    const firstTab=document.querySelector('#mainNav .tab');
    if(firstTab)switchMainTab(firstTab,'deriv');
  },300);
}

function onLogout(){
  setCurrentUser(null);setAllTrades([]);
  document.getElementById('appScreen').style.display='none';
  document.getElementById('authScreen').style.display='flex';
  document.getElementById('loginEmail').value='';
  document.getElementById('loginPassword').value='';
  document.getElementById('loginError').style.display='none';
}


