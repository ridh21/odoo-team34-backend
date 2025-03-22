import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Predefined Aadhaar-like JSON data
const aadhaarData = [
    {
        "adharNumber": "881248700907",
        "name": "Deepak Joshi",
        "mobileNumber": "7513329778",
        "dob": "1977-05-06",
        "gender": "Male",
        "address": "312, Salt Lake, Kolkata"
    },
    {
        "adharNumber": "664535155537",
        "name": "Rekha Tiwari",
        "mobileNumber": "9372124939",
        "dob": "1955-02-24",
        "gender": "Female",
        "address": "920, Rajajinagar, Bangalore"
    },
    {
        "adharNumber": "301152340662",
        "name": "Meera Reddy",
        "mobileNumber": "8721239126",
        "dob": "1953-11-30",
        "gender": "Female",
        "address": "201, Andheri, Mumbai"
    },
    {
        "adharNumber": "288946283712",
        "name": "Meera Reddy",
        "mobileNumber": "9889816664",
        "dob": "1961-03-02",
        "gender": "Female",
        "address": "717, Ameerpet, Hyderabad"
    },
    {
        "adharNumber": "456840251024",
        "name": "Sameer Ali",
        "mobileNumber": "8631576834",
        "dob": "2000-07-05",
        "gender": "Male",
        "address": "849, Bandra, Mumbai"
    },
    {
        "adharNumber": "553320066258",
        "name": "Rashmi Sen",
        "mobileNumber": "7338667864",
        "dob": "1973-11-17",
        "gender": "Female",
        "address": "415, Lalbagh, Kolkata"
    },
    {
        "adharNumber": "680367937354",
        "name": "Swati Mehta",
        "mobileNumber": "6803921592",
        "dob": "1960-01-07",
        "gender": "Female",
        "address": "257, Gomti Nagar, Lucknow"
    },
    {
        "adharNumber": "309085197569",
        "name": "Amit Sharma",
        "mobileNumber": "6849911683",
        "dob": "1994-08-20",
        "gender": "Male",
        "address": "174, Thane West, Thane"
    },
    {
        "adharNumber": "085993894306",
        "name": "Sneha Roy",
        "mobileNumber": "6250689475",
        "dob": "1998-01-14",
        "gender": "Female",
        "address": "767, Connaught Place, Delhi"
    },
    {
        "adharNumber": "347860737971",
        "name": "Priya Das",
        "mobileNumber": "8634104103",
        "dob": "1993-05-24",
        "gender": "Female",
        "address": "471, Lalbagh, Kolkata"
    },
    {
        "adharNumber": "130202443204",
        "name": "Meera Reddy",
        "mobileNumber": "8001126089",
        "dob": "1987-02-15",
        "gender": "Female",
        "address": "542, Connaught Place, Delhi"
    },
    {
        "adharNumber": "857511133398",
        "name": "Harish Reddy",
        "mobileNumber": "9793077726",
        "dob": "1952-12-14",
        "gender": "Male",
        "address": "579, Koramangala, Bangalore"
    },
    {
        "adharNumber": "991658814464",
        "name": "Naveen Shetty",
        "mobileNumber": "8790250286",
        "dob": "1975-07-25",
        "gender": "Male",
        "address": "168, Koramangala, Bangalore"
    },
    {
        "adharNumber": "021916738486",
        "name": "Naveen Shetty",
        "mobileNumber": "7146916411",
        "dob": "1959-05-30",
        "gender": "Male",
        "address": "177, Lalbagh, Kolkata"
    },
    {
        "adharNumber": "223059609379",
        "name": "Suresh Patil",
        "mobileNumber": "9606629859",
        "dob": "1994-10-14",
        "gender": "Male",
        "address": "21, Viman Nagar, Pune"
    },
    {
        "adharNumber": "428841474427",
        "name": "Harish Reddy",
        "mobileNumber": "7165652969",
        "dob": "1988-07-19",
        "gender": "Male",
        "address": "745, Ameerpet, Hyderabad"
    },
    {
        "adharNumber": "100228030385",
        "name": "Amit Sharma",
        "mobileNumber": "7889574182",
        "dob": "1980-11-26",
        "gender": "Male",
        "address": "445, Janakpuri, Delhi"
    },
    {
        "adharNumber": "803660753436",
        "name": "Sandeep Pawar",
        "mobileNumber": "9877336471",
        "dob": "1988-02-16",
        "gender": "Male",
        "address": "230, Viman Nagar, Pune"
    },
    {
        "adharNumber": "873879615156",
        "name": "Suresh Patil",
        "mobileNumber": "9238679778",
        "dob": "1951-12-24",
        "gender": "Male",
        "address": "347, Charminar, Hyderabad"
    },
    {
        "adharNumber": "157324525092",
        "name": "Asha Dutta",
        "mobileNumber": "6892788119",
        "dob": "1980-08-10",
        "gender": "Female",
        "address": "172, Koramangala, Bangalore"
    },
    {
        "adharNumber": "632371585877",
        "name": "Priya Das",
        "mobileNumber": "9195447110",
        "dob": "1969-03-03",
        "gender": "Female",
        "address": "714, Rajajinagar, Bangalore"
    },
    {
        "adharNumber": "644409213634",
        "name": "Manoj Desai",
        "mobileNumber": "6394343309",
        "dob": "1976-04-01",
        "gender": "Male",
        "address": "194, Rajajinagar, Bangalore"
    },
    {
        "adharNumber": "111645797261",
        "name": "Swati Mehta",
        "mobileNumber": "9183054360",
        "dob": "1977-02-08",
        "gender": "Female",
        "address": "774, Connaught Place, Delhi"
    },
    {
        "adharNumber": "808134966807",
        "name": "Karthik Menon",
        "mobileNumber": "9078604997",
        "dob": "1951-02-11",
        "gender": "Male",
        "address": "592, Connaught Place, Delhi"
    },
    {
        "adharNumber": "441349114674",
        "name": "Neha Choudhary",
        "mobileNumber": "9673442476",
        "dob": "1959-07-27",
        "gender": "Female",
        "address": "819, Andheri, Mumbai"
    },
    {
        "adharNumber": "723282776920",
        "name": "Harish Reddy",
        "mobileNumber": "6692535261",
        "dob": "1963-08-11",
        "gender": "Male",
        "address": "781, Malad East, Mumbai"
    },
    {
        "adharNumber": "124676914787",
        "name": "Neha Choudhary",
        "mobileNumber": "9192784818",
        "dob": "1995-05-01",
        "gender": "Female",
        "address": "195, Viman Nagar, Pune"
    },
    {
        "adharNumber": "099287778880",
        "name": "Sachin Kulkarni",
        "mobileNumber": "9344698261",
        "dob": "2004-07-14",
        "gender": "Male",
        "address": "38, Lalbagh, Kolkata"
    },
    {
        "adharNumber": "519422173990",
        "name": "Rekha Tiwari",
        "mobileNumber": "6532320761",
        "dob": "1950-08-22",
        "gender": "Female",
        "address": "581, MG Road, Bangalore"
    },
    {
        "adharNumber": "111805215043",
        "name": "Suresh Patil",
        "mobileNumber": "8868470863",
        "dob": "1954-05-06",
        "gender": "Male",
        "address": "968, Salt Lake, Kolkata"
    },
    {
        "adharNumber": "836847115865",
        "name": "Sneha Roy",
        "mobileNumber": "6468654116",
        "dob": "1972-07-30",
        "gender": "Female",
        "address": "845, Connaught Place, Delhi"
    },
    {
        "adharNumber": "700379880213",
        "name": "Anjali Gupta",
        "mobileNumber": "6965990328",
        "dob": "1963-10-19",
        "gender": "Female",
        "address": "263, Mylapore, Chennai"
    },
    {
        "adharNumber": "391188263950",
        "name": "Amit Sharma",
        "mobileNumber": "9626114839",
        "dob": "1960-02-20",
        "gender": "Male",
        "address": "825, Rajajinagar, Bangalore"
    },
    {
        "adharNumber": "436626264755",
        "name": "Pooja Mishra",
        "mobileNumber": "7057226997",
        "dob": "1978-04-17",
        "gender": "Female",
        "address": "941, Ameerpet, Hyderabad"
    },
    {
        "adharNumber": "001094782511",
        "name": "Pallavi Bose",
        "mobileNumber": "8228830836",
        "dob": "1978-04-28",
        "gender": "Female",
        "address": "161, Salt Lake, Kolkata"
    },
    {
        "adharNumber": "490496503623",
        "name": "Swati Mehta",
        "mobileNumber": "9807660022",
        "dob": "1983-02-09",
        "gender": "Female",
        "address": "556, Salt Lake, Kolkata"
    },
    {
        "adharNumber": "682845354924",
        "name": "Deepak Joshi",
        "mobileNumber": "8384729162",
        "dob": "1963-11-03",
        "gender": "Male",
        "address": "842, Ameerpet, Hyderabad"
    },
    {
        "adharNumber": "883668261714",
        "name": "Rekha Tiwari",
        "mobileNumber": "7855132087",
        "dob": "1958-01-05",
        "gender": "Female",
        "address": "390, Connaught Place, Delhi"
    },
    {
        "adharNumber": "465432417414",
        "name": "Sachin Kulkarni",
        "mobileNumber": "9313028770",
        "dob": "1986-03-20",
        "gender": "Male",
        "address": "13, Koramangala, Bangalore"
    },
    {
        "adharNumber": "473742373653",
        "name": "Meera Reddy",
        "mobileNumber": "7039511072",
        "dob": "1987-05-03",
        "gender": "Female",
        "address": "567, Bandra, Mumbai"
    },
    {
        "adharNumber": "379827741494",
        "name": "Gopal Rao",
        "mobileNumber": "9591041980",
        "dob": "1985-11-23",
        "gender": "Male",
        "address": "517, MG Road, Bangalore"
    },
    {
        "adharNumber": "032073879183",
        "name": "Pooja Mishra",
        "mobileNumber": "7592628169",
        "dob": "1976-08-13",
        "gender": "Female",
        "address": "667, Ameerpet, Hyderabad"
    },
    {
        "adharNumber": "106863741980",
        "name": "Prakash Iyer",
        "mobileNumber": "9546614555",
        "dob": "1965-10-18",
        "gender": "Male",
        "address": "379, Hinjewadi, Pune"
    },
    {
        "adharNumber": "400162492963",
        "name": "Divya Mukherjee",
        "mobileNumber": "6583425678",
        "dob": "1951-01-31",
        "gender": "Female",
        "address": "433, Alwarpet, Chennai"
    },
    {
        "adharNumber": "608106230215",
        "name": "Suresh Patil",
        "mobileNumber": "6620258327",
        "dob": "1965-09-25",
        "gender": "Male",
        "address": "751, Shivaji Nagar, Pune"
    },
    {
        "adharNumber": "110729152145",
        "name": "Rashmi Sen",
        "mobileNumber": "9418270463",
        "dob": "1992-01-25",
        "gender": "Female",
        "address": "600, Viman Nagar, Pune"
    },
    {
        "adharNumber": "380011449836",
        "name": "Gaurav Chauhan",
        "mobileNumber": "7832244141",
        "dob": "1986-05-28",
        "gender": "Male",
        "address": "229, MG Road, Bangalore"
    },
    {
        "adharNumber": "607138143416",
        "name": "Manoj Desai",
        "mobileNumber": "8400442896",
        "dob": "1971-10-13",
        "gender": "Male",
        "address": "680, Thane West, Thane"
    },
    {
        "adharNumber": "286480661296",
        "name": "Deepak Joshi",
        "mobileNumber": "9144831984",
        "dob": "1969-09-30",
        "gender": "Male",
        "address": "875, Thane West, Thane"
    },
    {
        "adharNumber": "940790438828",
        "name": "Ritika Paul",
        "mobileNumber": "6584679722",
        "dob": "1989-05-26",
        "gender": "Female",
        "address": "567, Ameerpet, Hyderabad"
    },
    {
        "adharNumber": "124082952752",
        "name": "Sandeep Pawar",
        "mobileNumber": "6302456471",
        "dob": "1975-02-02",
        "gender": "Male",
        "address": "153, Lalbagh, Kolkata"
    },
    {
        "adharNumber": "547969862689",
        "name": "Harish Reddy",
        "mobileNumber": "6714616191",
        "dob": "1999-07-02",
        "gender": "Male",
        "address": "558, Alwarpet, Chennai"
    },
    {
        "adharNumber": "554859819145",
        "name": "Priya Das",
        "mobileNumber": "7235141411",
        "dob": "1994-11-02",
        "gender": "Female",
        "address": "497, Hinjewadi, Pune"
    },
    {
        "adharNumber": "025641451037",
        "name": "Swati Mehta",
        "mobileNumber": "9059969342",
        "dob": "1992-09-17",
        "gender": "Female",
        "address": "313, Shivaji Nagar, Pune"
    },
    {
        "adharNumber": "091370496295",
        "name": "Sunil Yadav",
        "mobileNumber": "7530273445",
        "dob": "2002-06-22",
        "gender": "Male",
        "address": "485, Gomti Nagar, Lucknow"
    },
    {
        "adharNumber": "564054156294",
        "name": "Deepak Joshi",
        "mobileNumber": "7255184269",
        "dob": "1972-10-07",
        "gender": "Male",
        "address": "900, Gomti Nagar, Lucknow"
    },
    {
        "adharNumber": "313024503434",
        "name": "Vivek Bhardwaj",
        "mobileNumber": "9424837944",
        "dob": "1996-09-29",
        "gender": "Male",
        "address": "246, MG Road, Bangalore"
    },
    {
        "adharNumber": "406657879953",
        "name": "Sandeep Pawar",
        "mobileNumber": "8470797328",
        "dob": "1962-03-24",
        "gender": "Male",
        "address": "83, Connaught Place, Delhi"
    },
    {
        "adharNumber": "004858819239",
        "name": "Pooja Mishra",
        "mobileNumber": "7084929899",
        "dob": "1957-07-21",
        "gender": "Female",
        "address": "536, Salt Lake, Kolkata"
    },
    {
        "adharNumber": "445936923185",
        "name": "Sachin Kulkarni",
        "mobileNumber": "6648363690",
        "dob": "1967-06-24",
        "gender": "Male",
        "address": "446, Bandra, Mumbai"
    },
    {
        "adharNumber": "788568485588",
        "name": "Kiran Bedi",
        "mobileNumber": "8439052292",
        "dob": "1971-12-23",
        "gender": "Female",
        "address": "19, Alwarpet, Chennai"
    },
    {
        "adharNumber": "422475658087",
        "name": "Harish Reddy",
        "mobileNumber": "8191237451",
        "dob": "1985-01-26",
        "gender": "Male",
        "address": "34, Hinjewadi, Pune"
    },
    {
        "adharNumber": "652355505057",
        "name": "Asha Dutta",
        "mobileNumber": "7878871705",
        "dob": "1979-05-12",
        "gender": "Female",
        "address": "174, Ameerpet, Hyderabad"
    },
    {
        "adharNumber": "920424489727",
        "name": "Deepak Joshi",
        "mobileNumber": "6584101886",
        "dob": "1965-11-06",
        "gender": "Male",
        "address": "560, Bandra, Mumbai"
    },
    {
        "adharNumber": "321621112914",
        "name": "Karthik Menon",
        "mobileNumber": "6128843967",
        "dob": "1955-12-10",
        "gender": "Male",
        "address": "979, Rajajinagar, Bangalore"
    },
    {
        "adharNumber": "319785686106",
        "name": "Sandeep Pawar",
        "mobileNumber": "8564812284",
        "dob": "1955-01-11",
        "gender": "Male",
        "address": "84, MG Road, Bangalore"
    },
    {
        "adharNumber": "680050583155",
        "name": "Ritika Paul",
        "mobileNumber": "8787662146",
        "dob": "1971-04-09",
        "gender": "Female",
        "address": "244, Mylapore, Chennai"
    },
    {
        "adharNumber": "287386871444",
        "name": "Anjali Gupta",
        "mobileNumber": "8130610651",
        "dob": "1997-01-13",
        "gender": "Female",
        "address": "582, Ameerpet, Hyderabad"
    },
    {
        "adharNumber": "869576730646",
        "name": "Anil Kumar",
        "mobileNumber": "8432241969",
        "dob": "1958-10-01",
        "gender": "Male",
        "address": "702, Malad East, Mumbai"
    },
    {
        "adharNumber": "822772806133",
        "name": "Pooja Mishra",
        "mobileNumber": "9098497109",
        "dob": "1967-04-08",
        "gender": "Female",
        "address": "144, Lalbagh, Kolkata"
    },
    {
        "adharNumber": "325800032015",
        "name": "Neha Choudhary",
        "mobileNumber": "8945399955",
        "dob": "2002-02-26",
        "gender": "Female",
        "address": "236, Mylapore, Chennai"
    },
    {
        "adharNumber": "522358676901",
        "name": "Rashmi Sen",
        "mobileNumber": "9875233329",
        "dob": "1981-11-07",
        "gender": "Female",
        "address": "832, Gomti Nagar, Lucknow"
    },
    {
        "adharNumber": "841572535806",
        "name": "Sunil Yadav",
        "mobileNumber": "9059515778",
        "dob": "1989-12-07",
        "gender": "Male",
        "address": "804, Salt Lake, Kolkata"
    },
    {
        "adharNumber": "116859856528",
        "name": "Harish Reddy",
        "mobileNumber": "7121085522",
        "dob": "1993-07-15",
        "gender": "Male",
        "address": "545, Mylapore, Chennai"
    },
    {
        "adharNumber": "408746472617",
        "name": "Swati Mehta",
        "mobileNumber": "7527274823",
        "dob": "1961-04-06",
        "gender": "Female",
        "address": "563, Connaught Place, Delhi"
    },
    {
        "adharNumber": "930456667518",
        "name": "Priya Das",
        "mobileNumber": "9677329286",
        "dob": "1981-01-24",
        "gender": "Female",
        "address": "251, Thane West, Thane"
    },
    {
        "adharNumber": "608539921980",
        "name": "Harish Reddy",
        "mobileNumber": "7409170666",
        "dob": "1973-01-21",
        "gender": "Male",
        "address": "389, Koramangala, Bangalore"
    },
    {
        "adharNumber": "752450650163",
        "name": "Arun Nair",
        "mobileNumber": "8693898023",
        "dob": "2002-06-25",
        "gender": "Male",
        "address": "928, Connaught Place, Delhi"
    },
    {
        "adharNumber": "382046925170",
        "name": "Vikram Singh",
        "mobileNumber": "6715850096",
        "dob": "1956-08-01",
        "gender": "Male",
        "address": "424, Andheri, Mumbai"
    },
    {
        "adharNumber": "104315105516",
        "name": "Priya Das",
        "mobileNumber": "6417671822",
        "dob": "1979-06-18",
        "gender": "Female",
        "address": "792, Andheri, Mumbai"
    },
    {
        "adharNumber": "395560148049",
        "name": "Vikram Singh",
        "mobileNumber": "7814835101",
        "dob": "1974-10-20",
        "gender": "Male",
        "address": "651, Malad East, Mumbai"
    },
    {
        "adharNumber": "521177992921",
        "name": "Harish Reddy",
        "mobileNumber": "9588383192",
        "dob": "1979-09-22",
        "gender": "Male",
        "address": "167, MG Road, Bangalore"
    },
    {
        "adharNumber": "142610702158",
        "name": "Sneha Roy",
        "mobileNumber": "9643837746",
        "dob": "1998-06-14",
        "gender": "Female",
        "address": "231, Koramangala, Bangalore"
    },
    {
        "adharNumber": "227532795315",
        "name": "Naveen Shetty",
        "mobileNumber": "7586617399",
        "dob": "1995-08-04",
        "gender": "Male",
        "address": "268, Gomti Nagar, Lucknow"
    },
    {
        "adharNumber": "918119247946",
        "name": "Swati Mehta",
        "mobileNumber": "9929940272",
        "dob": "1994-10-02",
        "gender": "Female",
        "address": "705, Gomti Nagar, Lucknow"
    },
    {
        "adharNumber": "663248526541",
        "name": "Harish Reddy",
        "mobileNumber": "7835062230",
        "dob": "1996-04-05",
        "gender": "Male",
        "address": "681, Janakpuri, Delhi"
    },
    {
        "adharNumber": "721533289570",
        "name": "Rashmi Sen",
        "mobileNumber": "6637605104",
        "dob": "1965-08-19",
        "gender": "Female",
        "address": "515, Gomti Nagar, Lucknow"
    },
    {
        "adharNumber": "972063203679",
        "name": "Anil Kumar",
        "mobileNumber": "9616279961",
        "dob": "1959-05-22",
        "gender": "Male",
        "address": "734, Bandra, Mumbai"
    },
    {
        "adharNumber": "521475173377",
        "name": "Manoj Desai",
        "mobileNumber": "8018362787",
        "dob": "1971-10-05",
        "gender": "Male",
        "address": "352, Viman Nagar, Pune"
    },
    {
        "adharNumber": "311891022632",
        "name": "Sandeep Pawar",
        "mobileNumber": "7195830347",
        "dob": "1976-05-20",
        "gender": "Male",
        "address": "504, Charminar, Hyderabad"
    },
    {
        "adharNumber": "772229326481",
        "name": "Suresh Patil",
        "mobileNumber": "9434480798",
        "dob": "1989-08-17",
        "gender": "Male",
        "address": "874, Bandra, Mumbai"
    },
    {
        "adharNumber": "661196640383",
        "name": "Amit Sharma",
        "mobileNumber": "8882795565",
        "dob": "1977-01-01",
        "gender": "Male",
        "address": "963, Mylapore, Chennai"
    },
    {
        "adharNumber": "166088969443",
        "name": "Sameer Ali",
        "mobileNumber": "6518635650",
        "dob": "1997-04-11",
        "gender": "Male",
        "address": "493, Rajajinagar, Bangalore"
    },
    {
        "adharNumber": "984624631669",
        "name": "Rahul Saxena",
        "mobileNumber": "7480404556",
        "dob": "1985-09-27",
        "gender": "Male",
        "address": "676, Charminar, Hyderabad"
    },
    {
        "adharNumber": "611572713267",
        "name": "Sachin Kulkarni",
        "mobileNumber": "6681249682",
        "dob": "1955-01-15",
        "gender": "Male",
        "address": "11, Charminar, Hyderabad"
    },
    {
        "adharNumber": "814672326509",
        "name": "Pooja Mishra",
        "mobileNumber": "9987844651",
        "dob": "1951-10-07",
        "gender": "Female",
        "address": "947, Connaught Place, Delhi"
    },
    {
        "adharNumber": "809127969109",
        "name": "Sandeep Pawar",
        "mobileNumber": "6193564724",
        "dob": "1993-06-05",
        "gender": "Male",
        "address": "811, Lalbagh, Kolkata"
    },
    {
        "adharNumber": "137724598531",
        "name": "Amit Sharma",
        "mobileNumber": "6779608890",
        "dob": "1990-10-11",
        "gender": "Male",
        "address": "452, Andheri, Mumbai"
    },
    {
        "adharNumber": "060146228056",
        "name": "Deepak Joshi",
        "mobileNumber": "8669993741",
        "dob": "1977-12-10",
        "gender": "Male",
        "address": "462, Andheri, Mumbai"
    },
    {
        "adharNumber": "212677287655",
        "name": "Rekha Tiwari",
        "mobileNumber": "9376718217",
        "dob": "1978-03-17",
        "gender": "Female",
        "address": "605, Koramangala, Bangalore"
    }
]

async function main() {
  console.log("Seeding Aadhaar data...");

  await prisma.adharCard.createMany({
    data: aadhaarData.map((entry) => ({
      ...entry,
      dob: new Date(entry.dob),
      gender: entry.gender === "Male" ? "Male" : entry.gender === "Female" ? "Female" : null,
    })),
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
