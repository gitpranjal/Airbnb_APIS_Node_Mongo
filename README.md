# AirportSystemBackend
Creeted in Node JS

List of APIS and corresponding SQLqueries used

1. "/login"           :     select * from users where Username="${username}" and Password="${password}"                     
2. "/userInfoPage     :     select * from users where Username="${Username}" and Password="${Password}
3. "/flightDetails"   :     select * from Flight
4. "/announcements"   :     select * from Announcement
5. "/addUser"         :     insert into Users (SSN, Password, Address, Phoneno, Fname, Mname, Lname, Username, UserType)
                        values (${inputObject.SSN},
                             "${inputObject.Password}", 
                             "${inputObject.Address}", 
                             ${inputObject.Phoneno},
                             "${inputObject.Fname}",
                             "${inputObject.Mname}",
                             "${inputObject.Lname}",
                             "${inputObject.Username}",
                             "${inputObject.UserType}")`  


6. "/deleteUser"       :    delete from Users where SSN = ${inputObject.SSN}
8. "/updateUserInfo"   :    update Users set SSN=${updatedInfoObject.SSN != null ? updatedInfoObject.SSN : userObjectBeforeUpdation.SSN},
        Password="${Password}",
        Address="${Address}",
        Phoneno=${Phoneno},
        Fname="${Fname}",
        Mname="${Mname}",
        Lname="${Lname}",
        Username="${Username}",
        UserType="${UserType}"
        where SSN = ${SSN}


9. "/getUserList"      :     select * from users
10. 