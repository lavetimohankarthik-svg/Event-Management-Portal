const { Parser } = require("json2csv");

const Registration = require("../models/Registration");

const exportParticipants = async(eventId)=>{

const registrations =
await Registration.find({

event:eventId

})

.populate(
"participant",
"firstName lastName email phoneNumber collegeName"
);

const data = registrations.map(r=>({

FirstName:r.participant.firstName,

LastName:r.participant.lastName,

Email:r.participant.email,

Phone:r.participant.phoneNumber,

College:r.participant.collegeName,

CheckedIn:r.checkedIn

}));

const parser =
new Parser();

return parser.parse(data);

};

module.exports={

exportParticipants

};