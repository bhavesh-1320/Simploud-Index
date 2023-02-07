const e = require('express');
const { type, set } = require('express/lib/response');
const { types } = require('util');

//Check file and folder exist
try{
    // const cId = '3MVG9sSN_PMn8tjQgohkUNArLtJ4Ndev0lIfqPxxm8iTzoef.Dy3jpVZeCyCnHqxzCHuj1UiDWfa5ZuPArIBD';
    // const cSecret = '0CCA90118DC4084E6485AAABBC00DEA7794A39E55471B0DC8E89AE9D6195FB3C';
    // const refreshToken = '5Aep861Ylaxber_9t7sfNF_WEtv4VxVS_D8SvHTOPQT.aXPaiCGdI0ralkQjyx8qTycJIkEr5uI8xiuWLEwMBX9';
    // const prodOrgId = '00D0E000000Av8XUAS';
    // //Client Cred 
    const cId = '3MVG91BJr_0ZDQ4sETLN1BxVXeHJ4Qcposy6e4RN.862ZmEYPS0Rd0pXcTF0orAhaaAQVFModh8_C3onNUuSj';
    const cSecret = '19B60FB24547738BAEA8C82FD8907B5246BA5E499EF8B4A0F54D896DD0C3442D';
    const refreshToken = '5Aep861KhtojOqEEpceipPyPM.6pzTT95uiqnvMZHivQn_DcvuCI3v7arRAFMyc5PJQLcBMvTjjz3dvhy._simR';
    const prodOrgId = '00D3X000002KHf2UAG';
     
    // productionLogin='https://test.salesforce.com';
    // prod='--sandbox';
    productionLogin='https://login.salesforce.com';
    prod='';


    sandbox='--sandbox';
    const archiver = require('archiver');
    globalContent='';
    const accessTokenPath = '/services/oauth2/token'; 
    const express = require('express');
    const xml = require( 'xml2js' );
    const unzipper = require( 'unzipper' );
    const app = express();
    const fs = require('fs');
    var status = '';
    var jsforce = require('jsforce');
    let fetch = require('node-fetch');
    const bodyParser = require('body-parser');
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

    
    var globalDeleteInd=0;
    var globalQuickActions='';
    var globalCompactLayout='';
    var finalChanges={};
    globalMembers='';
    var globalContentDocumentId = {};
    var i = 0;
    const util = require('util');
    const { Console, time } = require('console');
    const { system } = require('nodemon/lib/config');
    const { reverse } = require('lodash');
    const res = require('express/lib/response');
    const exec = util.promisify(require('child_process').exec);

    app.listen(3000, () => {
        console.log("listening to port 3000...")
    });
    app.post("/postConfigItem", (req, res) => {
        console.log('data is here ');
        const data = req.body;
        res.send('Post Called');
        if( data.eventAction == 'delete' ){
            deleteConfigItem( data );
        }else{
            createConfigItem( data, data.UserName, data.Password );
        }
        console.log(i);
        i++;
        
    });
    app.post("/postNotesAttachments", (req, res) => {
        console.log('Post Called ');
        res.send('Post Called');
        const data = req.body;
        createNotes( data, data.UserName, data.Password );
        // if( data.instance == 'Customer' ){
    });

    app.post("/csvRecords",(req,res)=>{
        try {

            res.send('Fetched File');
            var data = req.body;
            console.log('Data : ',data);
            let arrayOfRecords=data.Body.split('\r\n');
            console.log('String body : ',arrayOfRecords);
            let jsonKeys=arrayOfRecords[0].split(',');
            arrayOfRecords=arrayOfRecords.slice(1);

            let jsonOfRecords=[];

            arrayOfRecords.forEach(record=>{
                let splitedRecord=record.split(',');
                let localJson={};
                for (let i = 0; i < jsonKeys.length; i++) {
                    localJson[jsonKeys[i]]=splitedRecord[i];
                }
                jsonOfRecords.push(localJson);
            });

            console.log('JSON : ',jsonOfRecords );
            
        } catch (error) {
            res.send(error);
        }
    })

    app.post("/compareCompliance",(req,res)=>{
        
        console.log('STARTING COMPARECOMPLIANCE ');

        let complianceCompareStatus=[];
        let complianceComparePDF=[];
        let complianceCompareDocument=[];
        let complianceCompareBinder=[];
        let complianceCompareTask=[];
        let complianceCompareAudit=[];

        var data = req.body;
        res.send('Fetching Records');
        let conn = new jsforce.Connection({
            loginUrl : 'https://test.salesforce.com'
        });

        status = 'Starting';
        console.log('Comparing Compliance');

        conn.login(data.userName, data.password+data.sToken, function(err, userInfo) {
            if (err) { 
                status = 'error Wrong Password or Security Token in Sandbox';
                return console.error(err); 
            }
            // console.log('DATA CC FIELDS : ',data.ccFields);
            var q = `SELECT Id, ${data.ccFields} FROM Simploud__Compliance_Configuration__c WHERE Simploud__Object_API_Name__c=\'${data.objUsed}\' `;
            var conn2 = new jsforce.Connection({
                loginUrl : productionLogin 
            });

            conn2.login(data.CustProductionUserName, data.custPRoductionPassword+data.custProductionSecurtiy, function(err, userInfo) {
                if (err) { 
                    status = 'error Wrong Password or Security Token in Production';
                    return console.error(err); 
                }
                status = 'Fetching Records';
                try {
                    console.log('Comparing Status');
                    conn.query(q+' AND Simploud__Flow_Type__c = \'Status Changing\' AND Simploud__Setting_Type__c = \'Status Flow\'', async function(err, res) {
                        var type='(\'\')';
    
                        if(res.records.length!=0){
                            type = '(';
                            for( var i = 0; i<res.records.length; i++ ){
                                type+='\''+res.records[i].Simploud__On_Status_Value__c + '\',';
                            }
                            if( type.length > 1 )
                            type = type.slice(0, -1);
                            type+=')';
                        }
                        conn2.query(q+' AND Simploud__Flow_Type__c = \'Status Changing\' AND Simploud__Setting_Type__c = \'Status Flow\' AND Simploud__On_Status_Value__c IN '+type, async function(err, res2) {
                            if(res2.records.length!=0){
        
                                let sandMap={};
                                let prodMap={};
        
                                try{
        
                                    res.records.forEach(ele=>{
                                        if(ele.Simploud__On_Status_Value__c!=undefined && ele.Simploud__On_Status_Value__c!=null){
                                            sandMap[ele.Simploud__On_Status_Value__c]=ele;
                                        }
                                    })
            
                                    res2.records.forEach(ele=>{
                                        if(ele.Simploud__On_Status_Value__c!=undefined && ele.Simploud__On_Status_Value__c!=null){
                                            prodMap[ele.Simploud__On_Status_Value__c]=ele;
                                        }
                                    })
            
                                    for( var val in sandMap ){
                                        if(prodMap[val]!=undefined){
        
                                            jsonMapSand=sandMap[val];
                                            jsonMapProd=prodMap[val];
            
                                            for(var ele in jsonMapSand){
                                                if(ele != 'attributes' && ele != 'Id' && ele != 'OwnerId' ){
                                                    if(jsonMapProd[ele]!=jsonMapSand[ele]){
                                                        complianceCompareStatus.push('Change in '+ele+' Of status '+val );
                                                    }
                                                }
                                            }
                                        }else {
                                            complianceCompareStatus.push(val+' New Status');
                                        }
                                    }
                                    
                                }catch(e){
                                    console.log(e);
                                }
                            }else if(res.records.length!=0){
                                complianceCompareStatus.push("No records in Production of Simploud__Flow_Type__c : \'Status Changing\' and Simploud__Setting_Type__c : \'Status Flow\' and Simploud__On_Status_Value__c : "+type);
                            }
                            
                            console.log('Comparing PDF');
                            conn.query(q+' AND Simploud__Setting_Type__c = \'PDF\'', async function(err, resultPDF) {
    
                                type='(\'\')';
    
                                if(resultPDF.records.length!=0){
    
                                    type = '(';
                                    for( let i = 0; i<resultPDF.records.length; i++ ){
                                        type+='\''+resultPDF.records[i].Simploud__PrintText__c + '\',';
                                    }
                                    if( type.length > 1 )
                                        type = type.slice(0, -1);
                                    type+=')';
                                }
                                conn2.query(q+' AND Simploud__Setting_Type__c = \'PDF\' AND Simploud__PrintText__c IN '+type, async function(err, resultPDF2) {
    
                                    if(resultPDF2.records.length!=0){
                                        
                                        sandMap={};
                                        prodMap={};
    
                                        resultPDF.records.forEach(ele=>{
                                            if(ele.Simploud__PrintText__c!=undefined && ele.Simploud__PrintText__c!=null){
                                                sandMap[ele.Simploud__PrintText__c]=ele;
                                            }
                                        })
                
                                        resultPDF2.records.forEach(ele=>{
                                            if(ele.Simploud__PrintText__c!=undefined && ele.Simploud__PrintText__c!=null){
                                                prodMap[ele.Simploud__PrintText__c]=ele;
                                            }
                                        })
                                        for( var val in sandMap ){
                
                                            if(prodMap[val]!=undefined){
            
                                                jsonMapSand=sandMap[val];
                                                jsonMapProd=prodMap[val];
                
                                                for(var ele in jsonMapSand){
                                                    if(ele != 'attributes' && ele != 'Id' && ele != 'OwnerId' ){
                                                        if(jsonMapProd[ele]!=jsonMapSand[ele]){
                                                            complianceComparePDF.push('Change in '+ele+' Of PDF Print '+val );
                                                        }
                                                    }
                                                }
                                            }else{
                                                complianceComparePDF.push(val+' New PDF Print');
                                            }
                                        }
                                    }else if(resultPDF.records.length!=0){
                                        complianceComparePDF.push("No records in Production of Simploud__Setting_Type__c : \'PDF\' and Simploud__PrintText__c : "+type);
                                    }

                                    console.log('Comparing Document');
                                    conn.query(q+' AND Simploud__Setting_Type__c = \'PDF Rendition\'', async function(err, resultDoc) {
                                        type='(\'\')';
                                        
                                        if(resultDoc.records.length!=0){
                                            type = '(';
                                            for( var i = 0; i<resultDoc.records.length; i++ ){
                                                type+='\''+resultDoc.records[i].Simploud__Document_Type__c + '\',';
                                            }
                                            if( type.length > 1 )
                                            type = type.slice(0, -1);
                                            type+=')';
                                        }else{
                                            // complianceCompareDocument.push("No records in Sandbox of Simploud__Setting_Type__c : \'PDF Rendition\' ");
                                        }
                                        conn2.query(q+' AND Simploud__Setting_Type__c = \'PDF Rendition\' AND Simploud__Document_Type__c IN '+type, async function(err, resultDoc2) {
                                            
                                            if(resultDoc2.records.length!=0){
    
                                                sandMap={};
                                                prodMap={};
                                                
                                                resultDoc.records.forEach(ele=>{
                                                    if(ele.Simploud__Document_Type__c!=undefined && ele.Simploud__Document_Type__c != null){
                                                        sandMap[ele.Simploud__Document_Type__c]=ele;
                                                    }
                                                })
                                                
                                                resultDoc2.records.forEach(ele=>{
                                                    if(ele.Simploud__Document_Type__c!=undefined && ele.Simploud__Document_Type__c != null){
                                                        prodMap[ele.Simploud__Document_Type__c]=ele;
                                                    }
                                                })
                        
                                                for( var val in sandMap ){
                                                    
                                                    if(prodMap[val]!=undefined){
                                                        
                                                        jsonMapSand=sandMap[val];
                                                        jsonMapProd=prodMap[val];
                                                        
                                                        for(var ele in jsonMapSand){
                                                            if(ele != 'attributes' && ele != 'Id' && ele != 'OwnerId' ){
                                                                if(jsonMapProd[ele]!=jsonMapSand[ele]){
                                                                    complianceCompareDocument.push('Change in '+ele+' Of Document '+val );
                                                                }
                                                            }
                                                        }
                                                    }else{
                                                        complianceCompareDocument.push(val+' New Document Type');
                                                    }
                                                    
                                                }
                                            }else if(resultDoc.records.length!=0){
                                                complianceCompareDocument.push("No records in Production of Simploud__Setting_Type__c : \'PDF Rendition\' and Simploud__Document_Type__c : "+type);
                                            }
    
                                            console.log('Comparing Binder');
                                            conn.query(q+' AND Simploud__Setting_Type__c = \'Binder\'', async function(err, resultBinder) {
                                                console.log(resultBinder.records.length);
                                                type='(\'\')';
    
                                                if(resultBinder.records.length!=0){
                                                    type = '(';
                                                    for( var i = 0; i<resultBinder.records.length; i++ ){
                                                        type+='\''+resultBinder.records[i].Simploud__Type__c + '\',';
                                                    }
                                                    if( type.length > 1 )
                                                        type = type.slice(0, -1);
                                                    type+=')';
                                                }
                                                else{
                                                    // complianceCompareBinder.push('No records in Sandbox of Simploud__Setting_Type__c : \'Binder\'')
                                                }
    
    
                                                conn2.query(q+' AND Simploud__Setting_Type__c = \'Binder\' AND Simploud__Type__c IN '+type, async function(err, resultBinder2){
    
    
                                                    if(resultBinder2.records.length!=0){
    
                                                        sandMap={};
                                                        prodMap={};
                                                        
                                                        resultBinder.records.forEach(ele=>{
                                                            if(ele.Simploud__Type__c!=undefined && ele.Simploud__Type__c!=null){
                                                                sandMap[ele.Simploud__Type__c]=ele;
                                                            }
                                                        })
                                                        
                                                        resultBinder2.records.forEach(ele=>{
                                                            if(ele.Simploud__Type__c!=undefined && ele.Simploud__Type__c!=null){
                                                                prodMap[ele.Simploud__Type__c]=ele;
                                                            }
                                                        })
                                
                                                        for( var val in sandMap ){
                                                            
                                                            if(prodMap[val]!=undefined){
                                                                
                                                                jsonMapSand=sandMap[val];
                                                                jsonMapProd=prodMap[val];
                                                                
                                                                for(var ele in jsonMapSand){
                                                                    if(ele != 'attributes' && ele != 'Id' && ele != 'OwnerId' ){
                                                                        if(jsonMapProd[ele]!=jsonMapSand[ele]){
                                                                            complianceCompareBinder.push('Change in '+ele+' Of Binder '+val );
                                                                        }
                                                                    }
                                                                }
                                                            }else{
                                                                complianceCompareBinder.push(val+' New Binder Type');
                                                            }
                                                            
                                                        }
                                                    }else if(resultBinder.records.length!=0){
                                                        complianceCompareBinder.push('No records in Production of Simploud__Setting_Type__c : \'Binder\' AND Simploud__Type__c :'+type);
                                                    }
                                                    var q2 =`SELECT Id, ${data.ccFields} FROM Simploud__Compliance_Configuration__c WHERE  Simploud__Setting_Type__c=\'Status Flow\' AND Simploud__Flow_Type__c = \'General/Training\' `;
    
                                                    console.log('Comparing Task');
                                                    conn.query(q2, async function(err, resultTask) {
                                                        type='(\'\')';
            
                                                        if(resultTask.records.length!=0){}
                                                        else{
                                                            // complianceCompareTask.push('No records in Sandbox of Simploud__Setting_Type__c=\'Status Flow\' AND Simploud__Flow_Type__c = \'General/Training\'')
                                                        }
                                                        conn2.query(q2, async function(err, resultTask2){
                                                            type='()';
            
            
                                                            if(resultTask2.records.length!=0){
            
                                                                sandMap={};
                                                                prodMap={};
                                                                
                                                                resultTask.records.forEach(ele=>{
                                                                    if(ele.Simploud__Record_Type__c!=undefined && ele.Simploud__Record_Type__c!=null ){
                                                                        sandMap[ele.Simploud__Record_Type__c]=ele;
                                                                    }
                                                                })
                                                                
                                                                resultTask2.records.forEach(ele=>{
                                                                    if(ele.Simploud__Record_Type__c!=undefined && ele.Simploud__Record_Type__c!=null ){
                                                                        prodMap[ele.Simploud__Record_Type__c]=ele;
                                                                    }
                                                                })
                                        
                                                                for( var val in sandMap ){
                                                                    
                                                                    if(prodMap[val]!=undefined){
                                                                        
                                                                        jsonMapSand=sandMap[val];
                                                                        jsonMapProd=prodMap[val];
                                                                        
                                                                        for(var ele in jsonMapSand){
                                                                            if(ele != 'attributes' && ele != 'Id' && ele != 'OwnerId' ){
                                                                                if(jsonMapProd[ele]!=jsonMapSand[ele]){
                                                                                    complianceCompareTask.push('  Change in '+ele+' Of Task - '+val );
                                                                                }
                                                                            }
                                                                        }
                                                                    }else{
                                                                        complianceCompareTask.push(val+' New Task Record Type');
                                                                    }
                                                                    
                                                                }
                                                            }else if(resultTask.records.length!=0){
                                                                complianceCompareTask.push('No records in Production of Simploud__Setting_Type__c=\'Status Flow\' AND Simploud__Flow_Type__c = \'General/Training\'')
                                                            }
    
                                                            
                                                            type = '('+'\''+data.objUsed+'\',';
                                                            for( var i = 0; i<data.relatedObj.length; i++ ){
                                                                type+='\''+data.relatedObj[i]+'\',';
                                                            }
                                                            if( type.length > 1 )
                                                                type = type.slice(0, -1);
                                                            type+=')';
    
                                                            var q3 = `SELECT Id, ${data.ccFields} FROM Simploud__Compliance_Configuration__c WHERE `;
    
                                                            console.log('Comparing Audit Trial');
                                                            conn.query(q3+' Simploud__Setting_Type__c = \'Audit Trail\' AND Simploud__Object_API_Name__c IN '+type, async function(err, res) {
    
                                                                conn2.query(q3+' Simploud__Setting_Type__c = \'Audit Trail\' AND Simploud__Object_API_Name__c IN '+type, async function(err, res2) {
    
                                                                    if(res2.records.length!=0){
            
                                                                        sandMap={};
                                                                        prodMap={};
                                                                        
                                                                        res.records.forEach(ele=>{
                                                                            if(ele.Simploud__Object_API_Name__c!=undefined && ele.Simploud__Object_API_Name__c!=null){
                                                                                sandMap[ele.Simploud__Object_API_Name__c]=ele;
                                                                            }
                                                                        })
                                                                        
                                                                        res2.records.forEach(ele=>{
                                                                            if(ele.Simploud__Object_API_Name__c!=undefined && ele.Simploud__Object_API_Name__c!=null){
                                                                                prodMap[ele.Simploud__Object_API_Name__c]=ele;
                                                                            }
                                                                        })
                                                                        for( var val in sandMap ){
                                                                            
                                                                            if(prodMap[val]!=undefined){
                                                                                
                                                                                jsonMapSand=sandMap[val];
                                                                                jsonMapProd=prodMap[val];
                                                                                
                                                                                for(var ele in jsonMapSand){
                                                                                    if(ele != 'attributes' && ele != 'Id' && ele != 'OwnerId' ){
                                                                                        if(jsonMapProd[ele]!=jsonMapSand[ele]){
                                                                                            complianceCompareAudit.push('Change in '+ele+' Of Audit Trail '+val );
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }else{
                                                                                complianceCompareAudit.push(val+' New Audit Trial Object Api Name');
                                                                            }
                                                                            
                                                                        }
                                                                    }else if(res.records.length!=0){
                                                                        complianceCompareAudit.push('No records in Production of Simploud__Setting_Type__c = \'Audit Trail\' AND Simploud__Object_API_Name__c IN '+type)
                                                                    }
                                                                    let compare=[];
    
                                                                    complianceCompareStatus.forEach(ele=>{
                                                                        compare.push({label:'Status',value:ele});
                                                                    })
                                                                    complianceComparePDF.forEach(ele=>{
                                                                        compare.push({label:'PDF',value:ele});
                                                                    })
                                                                    complianceCompareDocument.forEach(ele=>{
                                                                        compare.push({label:'Document',value:ele});
                                                                    })
                                                                    complianceCompareBinder.forEach(ele=>{
                                                                        compare.push({label:'Binder',value:ele});
                                                                    })
                                                                    complianceCompareTask.forEach(ele=>{
                                                                        compare.push({label:'Task',value:ele});
                                                                    })
                                                                    complianceCompareAudit.forEach(ele=>{
                                                                        compare.push({label:'Audit Trial',value:ele});
                                                                    })
                                                                        
                                                                    status={Compare:compare};
                                                                }) 
                                                            })
                                                        })
                                                    })
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                } catch (error) {
                    console.log(error);
                }
            })
        })
    })

    function deployComplianceRecords(data,groupNames){
        var finalCCRecs = [];
        var insRecs = [];
        let conn = new jsforce.Connection({
            loginUrl : 'https://test.salesforce.com'
        });
        conn.login(data.userName, data.password+data.sToken, function(err, userInfo) {
            if (err) { 
                status = 'error Wrong Password or Security Token in Sandbox';
                return console.error(err); 
            }
            // console.log('DATA CC FIELDS : ',data.ccFields);
            var q = `SELECT Id, ${data.ccFields} FROM Simploud__Compliance_Configuration__c WHERE Simploud__Object_API_Name__c=\'${data.objUsed}\' `;
            var conn2 = new jsforce.Connection({
                loginUrl : productionLogin
            });
            conn2.login(data.CustProductionUserName, data.custPRoductionPassword+data.custProductionSecurtiy, function(err, userInfo) {
                if (err) { 
                    status = 'error Wrong Password or Security Token in Production';
                    return console.error(err); 
                }
                //Status Changing
                try{

                    console.log('Fetching Records');
                    status = 'Fetching Records';
                    conn.query(q+'AND Simploud__Flow_Type__c = \'Status Changing\' AND Simploud__Setting_Type__c = \'Status Flow\'', async function(err, res) {
                        console.log('Status changing Records fetch from sandbox:',res.records.length);
                        if( res.records != undefined ){
                            if( res.records.length > 0 ){
                                var type = '(';
                                for( var i = 0; i<res.records.length; i++ ){
                                    type+='\''+res.records[i].Simploud__On_Status_Value__c + '\',';
                                }
                                if( type.length > 1 )
                                    type = type.slice(0, -1);
                                type+=')';
                                await conn2.query(q+' AND Simploud__Flow_Type__c = \'Status Changing\' AND Simploud__Setting_Type__c = \'Status Flow\' AND Simploud__On_Status_Value__c IN '+type, async function(err, res2) {
                                    console.log('Status changing Records fetch from prod:',res2.records.length);
                                    var sValueIdMap = {};
                                    for( var i = 0; i<res2.records.length; i++ ){
                                        sValueIdMap[res2.records[i].Simploud__On_Status_Value__c] = res2.records[i].Id;
                                    }
                                    for( var i = 0; i<res.records.length; i++ ){
                                        res.records[i].Id = sValueIdMap[res.records[i].Simploud__On_Status_Value__c];
                                        delete res.records[i].OwnerId;
                                        if( res.records[i].Id == undefined ){
                                            delete res.records[i].Id;
                                            insRecs.push( res.records[i] );
                                        }else
                                            finalCCRecs.push( res.records[i] );
                                    }
                                });         
                            }
                        }
                        //For Task
                        console.log('Fetching Task');
                        var type = groupNames;
                        if(type=='()'){
                            type='(\'\')';
                        }
                        var q2 = 'SELECT Id, '+data.ccFields+' FROM Simploud__Compliance_Configuration__c WHERE Simploud__Setting_Type__c=\'Status Flow\' AND Simploud__Flow_Type__c = \'General/Training\' AND Simploud__Record_Type__c IN '+type;
                        await conn.query(q2, async function(err, res) {
                            console.log('Task Records fetch from sandbox:',res.records.length);
                            if( res.records != undefined ){
                                if( res.records.length > 0 ){
                                    await conn2.query(q2, async function(err, res2) {
                                        console.log('Task Records fetch from prod:',res2.records.length);
                                        var sValueIdMap = {};
                                        for( var i = 0; i<res2.records.length; i++ ){
                                            sValueIdMap[res2.records[i].Simploud__Record_Type__c] = res2.records[i].Id;
                                        }
                                        for( var i = 0; i<res.records.length; i++ ){
                                            res.records[i].Id = sValueIdMap[res.records[i].Simploud__Record_Type__c];
                                            delete res.records[i].OwnerId;
                                            delete res.records[i].Simploud__Object_API_Name__c;
                                            if( res.records[i].Id == undefined ){
                                                delete res.records[i].Id;
                                                insRecs.push( res.records[i] );
                                            }else
                                                finalCCRecs.push( res.records[i] );
                                        }
                                    });         
                                }
                            }
                            //For PDF
                            console.log('Fetching PDF');
                            await conn.query(q+' AND Simploud__Setting_Type__c = \'PDF\'', async function(err, res) {
                                console.log('PDF Records fetch from sandbox:',res.records.length);
                                if( res.records != undefined ){
                                    if( res.records.length > 0 ){
                                        var type1 = '(';
                                        for( var i = 0; i<res.records.length; i++ ){
                                            type1+='\''+res.records[i].Simploud__PrintText__c + '\',';
                                        }
                                        if( type1.length > 1 )
                                            type1 = type1.slice(0, -1);
                                        type1+=')';
                                        await conn2.query(q+' AND Simploud__Setting_Type__c = \'PDF\' AND Simploud__PrintText__c IN '+type1, async function(err, res2) {
                                            console.log('PDF Records fetch from prod:',res2.records.length);
                                            var sValueIdMap = {};
                                            for( var i = 0; i<res2.records.length; i++ ){
                                                sValueIdMap[res2.records[i].Simploud__PrintText__c] = res2.records[i].Id;
                                            }
                                            for( var i = 0; i<res.records.length; i++ ){
                                                res.records[i].Id = sValueIdMap[res.records[i].Simploud__PrintText__c];
                                                delete res.records[i].OwnerId;
                                                if( res.records[i].Id == undefined ){
                                                    delete res.records[i].Id;
                                                    insRecs.push( res.records[i] );
                                                }else
                                                    finalCCRecs.push( res.records[i] );
                                            }
                                        });         
                                    }
                                }
                                //For Audit Trail
                                console.log('Fetching Audit Trail');
                                var type = '(';
                                type+='\''+data.objUsed+'\',';
                                for( var i = 0; i<data.relatedObj.length; i++ ){
                                    type+='\''+data.relatedObj[i]+'\',';
                                }
                                if( type.length > 1 )
                                    type = type.slice(0, -1);
                                type+=')';
                                var q3 = `SELECT Id, ${data.ccFields} FROM Simploud__Compliance_Configuration__c WHERE `;
                                await conn.query(q3+' Simploud__Setting_Type__c = \'Audit Trail\' AND Simploud__Object_API_Name__c IN '+type, async function(err, res) {
                                    console.log('Audit Trail Records fetch from sandbox:',res.records.length);
                                    if( res.records != undefined ){
                                        if( res.records.length > 0 ){
                                            await conn2.query(q3+' Simploud__Setting_Type__c = \'Audit Trail\' AND Simploud__Object_API_Name__c IN '+type, async function(err, res2) {
                                                console.log('Audit Trail Records fetch from prod:',res2.records.length);
                                                var sValueIdMap = {};
                                                for( var i = 0; i<res2.records.length; i++ ){
                                                    sValueIdMap[res2.records[i].Simploud__Object_API_Name__c] = res2.records[i].Id;
                                                }
                                                for( var i = 0; i<res.records.length; i++ ){
                                                    res.records[i].Id = sValueIdMap[res.records[i].Simploud__Object_API_Name__c];
                                                    delete res.records[i].OwnerId;
                                                    if( res.records[i].Id == undefined ){
                                                        delete res.records[i].Id;
                                                        insRecs.push( res.records[i] );
                                                    }else
                                                        finalCCRecs.push( res.records[i] );
                                                }
                                            });         
                                        }
                                    }
                                    //For Doc Setting
                                    status = 'Deploying';
                                    if( data.objUsed == 'Simploud__Controlled_Document__c' ){
                                        await conn.query(q+' AND Simploud__Setting_Type__c = \'PDF Rendition\'', async function(err, res) {
                                            if( res.records != undefined ){
                                                if( res.records.length > 0 ){
                                                    console.log('Doc Setting sanbox rec:', res.records.length);
                                                    var type = '(';
                                                    for( var i = 0; i<res.records.length; i++ ){
                                                        type+='\''+res.records[i].Simploud__Document_Type__c + '\',';
                                                    }
                                                    if( type.length > 1 )
                                                        type = type.slice(0, -1);
                                                    type+=')';
                                                    await conn2.query(q+' AND Simploud__Setting_Type__c = \'PDF Rendition\' AND Simploud__Document_Type__c IN '+type, async function(err, res2) {
                                                        if( res2.records != undefined ){
                                                            console.log('Doc Setting Records fetch from prod:',res2.records.length);
                                                            var sValueIdMap = {};
                                                            for( var i = 0; i<res2.records.length; i++ ){
                                                                sValueIdMap[res2.records[i].Simploud__Document_Type__c] = res2.records[i].Id;
                                                            }
                                                            for( var i = 0; i<res.records.length; i++ ){
                                                                res.records[i].Id = sValueIdMap[res.records[i].Simploud__Document_Type__c];
                                                                delete res.records[i].OwnerId;
                                                                if( res.records[i].Id == undefined ){
                                                                    delete res.records[i].Id;
                                                                    insRecs.push( res.records[i] );
                                                                }else
                                                                    finalCCRecs.push( res.records[i] );
                                                            }
                                                            getOrgIds(conn, 'Sandbox', conn2, finalCCRecs, insRecs,undefined,data);
                                                        }
                                                    });         
                                                }else{
                                                    getOrgIds(conn, 'Sandbox', conn2, finalCCRecs, insRecs,undefined,data);
                                                }
                                            }else{
                                                getOrgIds(conn, 'Sandbox', conn2, finalCCRecs, insRecs,undefined,data);
                                            }
                                        });
                                    }//For Binder Settings 
                                    else if( data.objUsed == 'Simploud__Binder__c' ){
                                        await conn.query(q+' AND Simploud__Setting_Type__c = \'Binder\'', async function(err, res) {
                                            console.log('Binder Records fetch from sandbox:',res.records.length);
                                            if( res.records != undefined ){
                                                if( res.records.length > 0 ){
                                                    var type = '(';
                                                    for( var i = 0; i<res.records.length; i++ ){
                                                        type+='\''+res.records[i].Simploud__Type__c + '\',';
                                                    }
                                                    if( type.length > 1 )
                                                        type = type.slice(0, -1);
                                                    type+=')';
                                                    await conn2.query(q+' AND Simploud__Setting_Type__c = \'Binder\' AND Simploud__Type__c IN '+type, async function(err, res2) {
                                                        console.log('Binder Records fetch from prod:',res2.records.length);
                                                        var sValueIdMap = {};
                                                        for( var i = 0; i<res2.records.length; i++ ){
                                                            sValueIdMap[res2.records[i].Simploud__Type__c] = res2.records[i].Id;
                                                        }
                                                        for( var i = 0; i<res.records.length; i++ ){
                                                            res.records[i].Id = sValueIdMap[res.records[i].Simploud__Type__c];
                                                            delete res.records[i].OwnerId;
                                                            if( res.records[i].Id == undefined ){
                                                                delete res.records[i].Id;
                                                                insRecs.push( res.records[i] );
                                                            }else
                                                                finalCCRecs.push( res.records[i] );
                                                        }
                                                        if( finalCCRecs.length > 0 ){
                                                            conn2.sobject("Simploud__Compliance_Configuration__c").update(finalCCRecs, function(err, ret) {
                                                                if(err){
                                                                    console.log('Error in updating records : ',err);
                                                                }else{
                                                                    console.log('Update Successfully', err);
                                                                }
                                                            });
                                                        }
                                                        if( insRecs.length > 0 ){
                                                            conn2.sobject("Simploud__Compliance_Configuration__c").create(insRecs, function(err, ret) {
                                                                if(err){
                                                                    console.log('Error in Inserting Records : ',err);
                                                                }else{
                                                                    console.log('Insert Successfully', ret);
                                                                }
                                                            });
                                                        }
                                                        setTimeout( ()=>{
                                                            if( data.Deploy == 'Entire' || data.Deploy == 'FinalEntire' ){
                                                                if(data.Entire.CustomSetting.length!=0){
                                                                    deployCustomSettingsRecord(data.Entire.CustomSetting,data);
                                                                }else{
                                                                    status = 'Completed';
                                                                }
                                                            }
                                                            else
                                                                status = 'CC Deployed';
                                                        }, 10000 );
                                                    });         
                                                }else{
                                                    if( finalCCRecs.length > 0 ){
                                                        conn2.sobject("Simploud__Compliance_Configuration__c").update(finalCCRecs, function(err, ret) {
                                                            if(err){
                                                                console.log('Error in updating records : ',err);
                                                            }else{
                                                                console.log('Update Successfully', err);
                                                            }
                                                        });
                                                    }
                                                    if( insRecs.length > 0 ){
                                                        conn2.sobject("Simploud__Compliance_Configuration__c").create(insRecs, function(err, ret) {
                                                            if(err){
                                                                console.log('Error in inserting records : ',err);
                                                            }else{
                                                                console.log('Update Successfully', err);
                                                            }
                                                        });
                                                    }
                                                    setTimeout( ()=>{
                                                        if( data.Deploy == 'Entire' || data.Deploy == 'FinalEntire' ){
                                                            if(data.Entire.CustomSetting.length!=0){
                                                                deployCustomSettingsRecord(data.Entire.CustomSetting,data);
                                                            }else{
                                                                status = 'Completed';
                                                            }
                                                        }
                                                        else
                                                            status = 'CC Deployed';
                                                    }, 10000 );
                                                }
                                            }else{
                                                if( finalCCRecs.length > 0 ){
                                                    conn2.sobject("Simploud__Compliance_Configuration__c").update(finalCCRecs, function(err, ret) {
                                                        if(err){
                                                            console.log('Error in updating records : ',err);
                                                        }else{
                                                            console.log('Update Successfully', err);
                                                        }
                                                    });
                                                }
                                                if( insRecs.length > 0 ){
                                                    conn2.sobject("Simploud__Compliance_Configuration__c").create(insRecs, function(err, ret) {
                                                        if(err){
                                                            console.log('Error in inserting records : ',err);
                                                        }else{
                                                            console.log('Update Successfully', err);
                                                        }
                                                    });
                                                }
                                                setTimeout( ()=>{
                                                    if( data.Deploy == 'Entire' || data.Deploy == 'FinalEntire' ){
                                                        if(data.Entire.CustomSetting.length!=0){
                                                            deployCustomSettingsRecord(data.Entire.CustomSetting,data);
                                                        }else{
                                                            status = 'Completed';
                                                        }
                                                    }
                                                    else
                                                        status = 'CC Deployed';
                                                }, 10000 );
                                            }
                                        });
                                    }else{
                                        getOrgIds(conn, 'Sandbox', conn2, finalCCRecs, insRecs,undefined,data);
                                    }
                                });
                            });
                        });
                    });

                }catch(e){
                    console.log(e);
                }
            });
        });

    }

    app.post( "/deployCompliance", ( req, res )=>{
        console.log('STARTING COMPLIANCE : ');
        var data = req.body;
        res.send( 'Fetching Records' );
        let conn = new jsforce.Connection({
            loginUrl : 'https://test.salesforce.com'
        });
        status = 'Fetching Records';
        console.log('Fetching Compliance Records');
        if( data.Deploy == 'Complaince Configuration' ){
            conn.login(data.userName, data.password+data.sToken, function(err, userInfo) {
                if (err) { 
                    status = 'error Wrong Password or Security Token in Sandbox';
                    return console.error(err); 
                }
                var conn2 = new jsforce.Connection({
                    loginUrl : productionLogin
                });
                conn2.login(data.CustProductionUserName, data.custPRoductionPassword+data.custProductionSecurtiy, function(err, userInfo) {
                    if (err) { 
                        status = 'error Wrong Password or Security Token in Production';
                        return console.error(err); 
                    }
                    getRelatedTask( data, conn, conn2, undefined, 'Deploy' );
                });
            });
        }else if( data.Deploy == 'FinalComplainceConfiguration' ){
            conn.login(data.userName, data.password+data.sToken,async function(err, userInfo) {
                if (err) { 
                    status = 'error Wrong Password or Security Token in Sandbox';
                    return console.error(err); 
                }
                var type = '(';
                if( data.GroupsNames != undefined ){
                    var gNames = data.GroupsNames;
                    gNames = gNames.replaceAll( '[', '' );
                    gNames = gNames.replaceAll( ']', '' );
                    var g = gNames.split(',');
                    for( var val of g ){
                        type+='\''+val+'\',';
                    }
                }
                if( type.length > 1 )
                    type = type.slice(0, -1);
                type+=')';
                deployComplianceRecords(data,type);          
            })
        }
    });
    
    
    
    async function getOrgIds(conn, org, conn2, finalCCRecs, insRecs, sandMap,data){

        var mapp={};

        conn.query("Select Id,Name From Group Where Type ='Regular'",async function(err,res){
            if(res.records.length!=0){
                res.records.forEach(ele=>{
                    mapp['Group:'+ele.Name]=ele.Id;
                })
            }

            conn.query("SELECT Id,Name FROM Simploud__Template__c WHERE Simploud__Type__c != 'Configuration'",async function(err,resTemp){
                if(resTemp.records.length!=0){
                    resTemp.records.forEach(ele=>{
                        mapp['Template:'+ele.Name]=ele.Id;
                    })
                }

                conn.query("SELECT Id,Name FROM Document WHERE ContentType = 'image/png' OR ContentType = 'image/jpg' OR ContentType = 'image/jpeg'",async function(err,resLogo){
                    if(resLogo.records.length!=0){
                        resLogo.records.forEach(ele=>{
                            mapp['Logo:'+ele.Name]=ele.Id;
                        })
                    }

                    conn.query("SELECT Id,Name FROM RecordType WHERE SObjectType = 'Task' AND IsActive = true",async function(err,resTask){
                        if(resTask.records.length!=0){
                            resTask.records.forEach(ele=>{
                                mapp['Task:'+ele.Name]=ele.Id;
                            })
                        }
                        if( org == 'Sandbox' ){
                            getOrgIds( conn2, 'Prod', undefined, finalCCRecs, insRecs, mapp ,data);
                        }else{
                            setOrgIds(conn, mapp ,sandMap , finalCCRecs , insRecs , 'Update' ,data);
                        }
                    })
                })
            })
        })
    }

    function setOrgIds(conn,mapp,sandMap,finalCCRecs,insRecs,method ,data){
        try {
    
            if(finalCCRecs!=undefined){
                finalCCRecs.forEach(ele=>{
        
                    for(let key in sandMap){
        
                        var sourceId=sandMap[key];
                        var prodId=mapp[key];
        
                        if(sourceId!=prodId)
                        {
                            if(ele.Simploud__Data__c!=null && ele.Simploud__Data__c.includes(sourceId)){
        
                                ele.Simploud__Data__c = ele.Simploud__Data__c.replaceAll(sourceId,prodId);
        
                            }if(ele.Simploud__Automations__c!=null && ele.Simploud__Automations__c.includes(sourceId)){
        
                                ele.Simploud__Automations__c = ele.Simploud__Automations__c.replaceAll(sourceId,prodId);
        
                            }if(ele.Simploud__Group_Incharge__c!=null && ele.Simploud__Group_Incharge__c.includes(sourceId)){
        
                                ele.Simploud__Group_Incharge__c = ele.Simploud__Group_Incharge__c.replaceAll(sourceId,prodId);
        
                            }if(ele.Simploud__Table_Types__c!=null && ele.Simploud__Table_Types__c.includes(sourceId)){
        
                                ele.Simploud__Table_Types__c = ele.Simploud__Table_Types__c.replaceAll(sourceId,prodId);
        
                            }
                        }
                    }
                })
            }
    
            if(method=='Update'){
    
                if( finalCCRecs.length > 0 ){
                    conn.sobject("Simploud__Compliance_Configuration__c").update(finalCCRecs, function(err, ret) {
                        if(err){
                            console.log('Error in updating records : ',err);
                        }else{
                            console.log('Update Successfully', err);
                        }
                    });
                }
    
                if(insRecs!=undefined){
                    if(insRecs.length!=0){
                        setOrgIds(conn, mapp ,sandMap , insRecs , undefined , 'Insert',data);
                    }
                    else{
                        setTimeout( ()=>{
                            if( data.Deploy == 'Entire' || data.Deploy == 'FinalEntire' ){
                                if(data.Entire.CustomSetting.length!=0){
                                    deployCustomSettingsRecord(data.Entire.CustomSetting,data);
                                }else{
                                    status = 'Completed';
                                }
                            }
                            else
                                status = 'CC Deployed';
                        }, 10000 );
                    }
                }else{
                    setTimeout( ()=>{
                        if( data.Deploy == 'Entire' || data.Deploy == 'FinalEntire' ){
                            if(data.Entire.CustomSetting.length!=0){
                                deployCustomSettingsRecord(data.Entire.CustomSetting,data);
                            }else{
                                status = 'Completed';
                            }
                        }
                        else
                            status = 'CC Deployed';
                    }, 10000 );
                }
    
            }else if(method=='Insert'){
                if( finalCCRecs.length > 0 ){
                    conn.sobject("Simploud__Compliance_Configuration__c").create(finalCCRecs, function(err, ret) {
                        if(err){
                            console.log('Error in inserting records : ',err);
                        }else{
                            console.log('Update Successfully', err);
                        }
                    });
                }
                setTimeout( ()=>{
                    if( data.Deploy == 'Entire' || data.Deploy == 'FinalEntire' ){
                        if(data.Entire.CustomSetting.length!=0){
                            deployCustomSettingsRecord(data.Entire.CustomSetting,data);
                        }else{
                            status = 'Completed';
                        }
                    }
                    else
                        status = 'CC Deployed';
                }, 10000 );
            }
            
        } catch (error) {
            console.log(error);
        }
    }

    app.post( "/backupData", ( req, res )=>{
        console.log('STARTING BACKUP');
        if(fs.existsSync('./unpackaged')){
            fs.rmdir('./unpackaged', { recursive: true }, err => {
                if (err) {
                  throw err
                }
            })
        }
        try{
            status = 'Retrieving configrations';
            console.log('Backing Up Data');
            res.send( status );
            const data = req.body;
            (async () =>{
                
                let conn = new jsforce.Connection({
                    loginUrl : 'https://test.salesforce.com'
                });

                let types='';
        
                await conn.login(data.userName, data.password+data.sToken,async function(err, userInfo) {
                    if (err) { 
                        status = 'error Wrong Password or Security Token in Sandbox';
                        return console.error(err); 
                    }
                    console.log('logged in');
                    
                    var folDas={};
                    
                    conn.query('SELECT SObjectType FROM ObjectPermissions GROUP BY SObjectType ORDER BY SObjectType ASC', async function(err, res) {


                        console.log('Fetching Sharing Setting');
                        res.records.forEach(ele=>{
                            types += `
                                    <types>
                                        <members>${ele.SobjectType}.*</members>
                                        <name>SharingCriteriaRule</name>
                                    </types>
                                    <types>
                                        <members>${ele.SobjectType}.*</members>
                                        <name>SharingOwnerRule</name>
                                    </types>
                                    <types>
                                        <members>${ele.SobjectType}</members>
                                        <name>CustomObject</name>
                                    </types>`;
                        })

                        types+=`
                                <types>
                                    <members>*</members>
                                    <name>FlexiPage</name>
                                </types>
                                `
                        types+='<types>';
                        res.records.forEach(ele=>{
                            types+='<members>'+ele.SobjectType+'</members>';
                        })


                        console.log('Fetching Custom Settings');
                        conn.query('SELECT Id, Label, MasterLabel, PluralLabel, DeveloperName, QualifiedApiName, KeyPrefix, NamespacePrefix FROM EntityDefinition WHERE IsCustomSetting = true Order by QualifiedApiName',async function(err,resc){

                            resc.records.forEach(ele=>{
                                types+='<members>'+ele.QualifiedApiName+'</members>';
                            })

                            types+=`<name>CustomObject</name>
                            </types>`;

                            console.log('Fetching Dashboard');
                            conn.query('SELECT Id,DeveloperName,FolderName,NamespacePrefix FROM Dashboard ',async function(err,result){
                                if(err)
                                {
                                    console.log(err);
                                }
                                var dashBoard=result.records;

                                dashBoard.forEach(ele=>{
                                    if(ele.NamespacePrefix!=null){
                                        ele.Name=ele.NamespacePrefix+'__'+ele.Name;
                                    }
                                })

                                console.log('success Dashboard')
                                conn.query('SELECT Id,Name,DeveloperName,NamespacePrefix FROM Folder ',async function(err,result){
                                    
                                    if(err)
                                    {
                                        console.log(err);
                                    }
                                    var fol=result.records;

                                    fol.forEach(ele=>{
                                        if(ele.NamespacePrefix!=null){
                                            ele.Name=ele.NamespacePrefix+'__'+ele.Name;
                                        }
                                    })
                                    
        
                                    let rep={};
                                    dashBoard.forEach(d=>{
                                        
                                        if(rep[d.FolderName]!=null&&rep[d.FolderName]!=undefined)
                                        {
                                            let temp=rep[d.FolderName];
                                            temp.push(d);
                                            rep[d.FolderName]=temp;
                                        }
                                        else
                                        {
                                            let temp=[];
                                            temp.push(d);
                                            rep[d.FolderName]=temp;
                                        }
                                    });
                                    
                                    fol.forEach(f=>{
                                        if(rep[f.Name]!=null)
                                        {
                                            folDas[f.DeveloperName]=rep[f.Name];
                                        }
                                    })
        
                                    types+=`<types>`;
                                    var k=Object.keys(folDas);
                                    k.forEach(ele=>{
                                        
                                        types+=`<members>${ele}</members>`;
                                        let key=folDas[ele];
                                        key.forEach(rep=>{
                                            types+=`<members>${ele}/${rep.DeveloperName}</members>`;
                                        })
                                        
                                    })
                                    types+=`<name>Dashboard</name>
                                    </types>`;
                                    
                                    
                                    var folRep={};
                                    
                                    console.log('Fetching Reports');
                                    conn.query('SELECT Name,Id,DeveloperName,FolderName,NamespacePrefix FROM Report ',async function(err,result){
                                        var reports=result.records;

                                        reports.forEach(ele=>{
                                            if(ele.NamespacePrefix!=null){
                                                ele.Name=ele.NamespacePrefix+'__'+ele.Name;
                                            }
                                        })

                                        if(err)
                                        {
                                            console.log(err);
                                        }
                                        conn.query('SELECT Id,Name,DeveloperName,NamespacePrefix FROM Folder ',async function(err,result){
        
                                            if(err)
                                            {
                                                console.log(err);
                                            }

                                            var fol=result.records;

                                            fol.forEach(ele=>{
                                                if(ele.NamespacePrefix!=null){
                                                    ele.Name=ele.NamespacePrefix+'__'+ele.Name;
                                                }
                                            })
                                            
                    
                                            let rep={};
                                            reports.forEach(r=>{
                                               
                                                 
                                                    if(r.FolderName=='Public Reports'){
                    
                                                        if(rep['unfiled$public']!=null&&rep['unfiled$public']!=undefined)
                                                        {
                                                            let temp=rep['unfiled$public'];
                                                            temp.push(r);
                                                            rep['unfiled$public']=temp;
                                                        }
                                                        else
                                                        {
                                                            let temp=[];
                                                            temp.push(r);
                                                            rep['unfiled$public']=temp;
                                                        }
                                                    }
                                                    else if(rep[r.FolderName]!=null&&rep[r.FolderName]!=undefined)
                                                    {
                                                        let temp=rep[r.FolderName];
                                                        temp.push(r);
                                                        rep[r.FolderName]=temp;
                                                    }
                                                    else
                                                    {
                                                        let temp=[];
                                                        temp.push(r);
                                                        rep[r.FolderName]=temp;
                                                    }
                                            });
                    
                    
                                            fol.forEach(f=>{
                                                if(rep[f.Name]!=null)
                                                {
                                                    folRep[f.DeveloperName]=rep[f.Name];
                                                }
                                            })
                    
                                            if(rep['unfiled$public']!=null&&rep['unfiled$public']!=undefined){
                                                folRep['unfiled$public']=rep['unfiled$public'];
                                            }
                                            
                                            
                                            types+=`<types>`;
                                            var k=Object.keys(folRep);
                                            k.forEach(ele=>{
                                                
                                                types+=`<members>${ele}</members>`;
        
                                                let key=folRep[ele];
                                                key.forEach(rep=>{
                                                    types+=`<members>${ele}/${rep.DeveloperName}</members>`;
                                                })
        
                                                
                                            })
                                            types+=`<name>Report</name>
                                            </types>`;
                                            
                                            createBackup(data,types);
                                        })
                                    })
                                })
                            }).catch(e=>{
                                console.log(e);
                            })
                        })
                    })   
                })
            })();
        }catch( err ){
            status = err+' error';
            console.log(err);
        }
    });
    
    
    
    async function createBackup(data,types)
    {
        var stream = fs.createWriteStream("package.xml");

        await stream.once('open', function(fd) {

                types+=
                `<types>
                    <members>Sharing</members>
                    <name>Settings</name>
                </types> 
            
                <types>
                    <members>*</members>
                    <name>Layout</name>
                </types>
                
                <types>
                    <members>*</members>
                    <name>Group</name>
                </types>
                
                <types>
                    <members>*</members>
                    <name>PermissionSet</name>
                </types>
                
                <types>
                    <members>*</members>
                    <name>Profile</name>
                </types>`;

                stream.write(
                    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                    <Package xmlns="http://soap.sforce.com/2006/04/metadata">
                    ${types}
                    <version>55.0</version>
                    </Package>`
                );
                stream.end();
        });
        
        var fileName = data.orgId+'_backup';
        
        
        const r = await backupData( data.userName, data.password, data.sToken, data.orgId, fileName, 'package' );
        if( r == 'Success' ){

            getAccessToken(productionLogin).then(resBody=>{
                var conn = new jsforce.Connection({
                    instanceUrl : resBody.instance_url,
                    accessToken : resBody.access_token
                });

                status = 'Retrieved configuration';
                console.log('Logging in org');
                
                
                const fs = require('fs');
                
                if (fs.existsSync(fileName+'.zip')) {

                    fs.readFile(fileName+'.zip',null, async (err, content) => {
                        var fileData = content.toString('base64');
                        var cVersion = {};
                        let d=new Date();
                        cVersion.Title = data.accountName.replaceAll(' ','_')+'_'+d;
                        cVersion.PathOnClient = data.accountName.replaceAll(' ','_')+'_'+d+'.zip';
                        cVersion.VersionData = fileData;
                        cVersion.Stop_Recursion__c = true;
                        conn.sobject("ContentVersion").create( cVersion, function(err, rets) {
                            status = 'Creating File';
                            if (err) { return console.error(err); }
                            if( rets!=undefined ){
                                var queryContentDocIds = "SELECT ContentDocumentId,Title FROM ContentVersion WHERE Id = '"+rets.id+"'";
                                console.log('Querying content doc Ids');
                                conn.query(queryContentDocIds, function(err, result) {
                                    if( result != undefined ){
                                        var contDocLinkRec = result.records;
                                        if( contDocLinkRec != undefined ){
                                            console.log('Creating cont doclink');
                                            var contDoc = {};
                                            contDoc.LinkedEntityId = data.accId;  
                                            contDoc.ContentDocumentId = contDocLinkRec[0].ContentDocumentId;
                                            conn.sobject("ContentDocumentLink").create( contDoc, function(err, rets) {
                                                console.log(err);
                                                console.log('ContentDocLinks created', rets);
                                                if(fs.existsSync(fileName+'.zip')){
                                                    console.log('File Exists');
                                                    fs.unlink(fileName+'.zip', function (err) {
                                                        if (err) throw err;
                                                        status = 'Completed';
                                                    });
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        });
                    });
                }
            })
        }else{
            status= r+' error';
        }
    }

    
    app.post( "/compareData", ( req, res )=>{

        console.log('STARTING COMPAREDATA');
        
        if(fs.existsSync('./unpackaged')){

            fs.rmdir('./unpackaged', { recursive: true }, err => {
                if (err) {
                  throw err
                }
            })
        }
        
        globalCompactLayout='';
        globalQuickActions='';
        finalChanges={};
        
        status='';
        res.send('Compare');
        console.log('Starting Compare');
        var data = req.body;
        var conn = new jsforce.Connection({
            loginUrl : 'https://test.salesforce.com'
        });

        conn.login(data.userName, data.password+data.sToken, function(err, userInfo) {
            if (err) { 
                status = 'error Wrong Password or Security Token in Sandbox';
                return console.error(err); 
            }
            if(data.relatedObj!=undefined ){
                var fullNames = [...data.relatedObj];
                fullNames.push(data.objUsed);
            }
            else{
                var fullNames=[data.objUsed];
            }
            
            conn.metadata.read('CustomObject', fullNames, function(err, metadata) {
                if( metadata != undefined ){
                    var FileName = data.objUsed+'_compare_'+data.Deploy+''+data.sandboxId;
                    FileName = FileName.replaceAll( ' ', '_' ); 
                    FileName = FileName.replaceAll( '/', '_' );
                    var prodFileName = data.objUsed+'_compare_'+data.Deploy+''+'prod'+data.sandboxId;
                    prodFileName = prodFileName.replaceAll( ' ', '_' );
                    prodFileName = prodFileName.replaceAll( '/', '_' );
                    if(data.Deploy == 'Fields')
                    {

                        console.log('Comparing Fields');
                        if(metadata.fields!=undefined){
                            if( metadata.fields.length !=undefined ){
                                createPackageFile(data, FileName, 'CustomField', metadata.fields, 'objects');
                            }
                            else{
                                let ar=[metadata.fields];
                                createPackageFile(data, FileName, 'CustomField', ar, 'objects');
                            }
                        }else if(metadata.length!=undefined){

                            var sendingAr=[];
                            var relatedObj=[];

                            metadata.forEach(ele=>{
                                if(ele.fields!=undefined && ele.fullName==data.objUsed){
                                    if(ele.fields.length!=undefined){
                                        sendingAr=ele.fields;
                                    }else{
                                        sendingAr.push(ele.fields);
                                    }
                                }else if(ele.fields!=undefined){
                                    relatedObj.push(ele);
                                }
                            })

                            if(sendingAr.length!=0){
                                createPackageFile(data, FileName, 'CustomField', sendingAr, 'objects',relatedObj);
                            }else{
                                status = 'Error-No fields';
                            }
                        }
                        else    status = 'Error-No fields';

                    }else if(data.Deploy == 'Lightning Page'){
                        conn.query("SELECT id,DurableId, QualifiedApiName FROM EntityDefinition WHERE QualifiedApiName='"+data.objUsed+"'",function(err,objName1){

                            console.log('Comparing Lightning Page');
                            let obj=objName1.records[0].DurableId;

                            conn.tooling.sobject('FlexiPage').find({ EntityDefinitionId : obj ,Type:"RecordPage"}).select('DeveloperName,MasterLabel,EntityDefinitionId,Type,NamespacePrefix').execute(function(err, records) {
                                let ar=[];
                                if(records!=undefined){
                                    if(records.length!=undefined){

                                        records.forEach(ele=>{
                                            if(ele.NamespacePrefix!=undefined){
                                                ele.DeveloperName=ele.NamespacePrefix+'__'+ele.DeveloperName;
                                            }
                                        })

                                        records.forEach(ele=>{
                                            ar.push(ele.DeveloperName);
                                        })

                                        if(data.relatedObj.length!=0){

                                            conn.query("SELECT id,DurableId, QualifiedApiName FROM EntityDefinition WHERE QualifiedApiName='"+data.relatedObj[0]+"'",function(err,objName2){

                                                let obj1=objName2.records[0].DurableId;

                                                conn.tooling.sobject('FlexiPage').find({ EntityDefinitionId : obj1 ,Type:"RecordPage"}).select('DeveloperName,MasterLabel,EntityDefinitionId,Type,NamespacePrefix').execute(function(err, records1) {
                                                    if(records1.length!=undefined){

                                                        records1.forEach(ele=>{
                                                            if(ele.NamespacePrefix!=undefined){
                                                                ele.DeveloperName=ele.NamespacePrefix+'__'+ele.DeveloperName;
                                                            }
                                                        })
                                                        records1.forEach(ele=>{
                                                            ar.push(ele.DeveloperName);
                                                        })

                                                        if(data.relatedObj.length>1){

                                                            conn.query("SELECT id,DurableId, QualifiedApiName FROM EntityDefinition WHERE QualifiedApiName='"+data.relatedObj[1]+"'",function(err,objName2){
                
                                                                let obj2=objName2.records[0].DurableId;
                
                                                                conn.tooling.sobject('FlexiPage').find({ EntityDefinitionId : obj2 ,Type:"RecordPage"}).select('DeveloperName,MasterLabel,EntityDefinitionId,Type,NamespacePrefix').execute(function(err, records2) {
                                                                    if(records2.length!=undefined){
                
                                                                        records2.forEach(ele=>{
                                                                            if(ele.NamespacePrefix!=undefined){
                                                                                ele.DeveloperName=ele.NamespacePrefix+'__'+ele.DeveloperName;
                                                                            }
                                                                        })
                                                                        records2.forEach(ele=>{
                                                                            ar.push(ele.DeveloperName);
                                                                        })

                                                                        if(ar.length>0){
                                                                            createPackageFile(data, FileName, 'FlexiPage', ar, 'flexipages');
                                                                        }else{
                                                                            status='Error : No Lightning Page';
                                                                        }

                                                                    }
                                                                })
                
                                                            })
                
                                                        }else if(ar.length>0){
                                                            createPackageFile(data, FileName, 'FlexiPage', ar, 'flexipages');
                                                        }else{
                                                            status='Error : No Lightning Page';
                                                        }

                                                    }
                                                })

                                            })

                                        }else if(ar.length>0){
                                            createPackageFile(data, FileName, 'FlexiPage', ar, 'flexipages');
                                        }
                                        else{
                                            status='Error : No Lightning Page';
                                        }
                                    }
                                    else{
                                        status='Error : No Lightning Page';
                                    }
                                }
                                else{
                                    status='Error : No Lightning Page';
                                }
                            })

                        })
                    }else if(data.Deploy == 'Layout')
                    {
                        console.log('Comparing Layout');
                        conn.query("SELECT id,DurableId, QualifiedApiName FROM EntityDefinition WHERE QualifiedApiName='"+data.objUsed+"'",function(err,objName1){

                            if(objName1.records.length!=0){

                                let obj=objName1.records[0].DurableId;
                                conn.tooling.sobject('Layout')
                                .find({ TableEnumOrId: obj }, "Name,NamespacePrefix,Id")
                                .execute(function(err, records) {

                                    records.forEach(ele=>{
                                        if(ele.NamespacePrefix!=null){
                                            ele.Name=ele.NamespacePrefix+'__'+ele.Name;
                                        }
                                    })
                                globalQuickActions='';
                                conn.tooling.sobject('QuickActionDefinition')
                                .find({SobjectType : data.objUsed}).select('DeveloperName,NamespacePrefix')
                                .execute(function(err, res) {
                                    
                                    res.forEach(ele=>{

                                        if(ele.NamespacePrefix!=null&&ele.NamespacePrefix!=undefined){
                                            globalQuickActions+='<members>'+data.objUsed+'.'+ele.NamespacePrefix+'__'+ele.DeveloperName+'</members>';
                                        }else{
                                            globalQuickActions+='<members>'+data.objUsed+'.'+ele.DeveloperName+'</members>';
                                        }

                                    })
                                    
                                    globalCompactLayout='';

                                    conn.tooling.sobject('CompactLayout')
                                    .find({SobjectType :data.objUsed}).select('DeveloperName,NamespacePrefix')
                                    .execute(function(err, res) {

                                        res.forEach(ele=>{
                                            if(ele.NamespacePrefix!=null&&ele.NamespacePrefix!=undefined){
                                                globalCompactLayout+='<members>'+data.objUsed+'.'+ele.NamespacePrefix+'__'+ele.DeveloperName+'</members>';
                                            }else{
                                                globalCompactLayout+='<members>'+data.objUsed+'.'+ele.DeveloperName+'</members>';
                                            }
                                        })
                                        if(data.relatedObj.length!=0){
        
                                            let relatedObj=[];
        
                                            conn.query("SELECT id,DurableId, QualifiedApiName FROM EntityDefinition WHERE QualifiedApiName='"+data.relatedObj[0]+"'",function(err,objName2){
        
                                                if(objName2.records.length!=0){
        
                                                    let obj1=objName2.records[0].DurableId;
        
                                                    conn.tooling.sobject('Layout')
                                                    .find({ TableEnumOrId: obj1 }, "Name,NamespacePrefix")
                                                    .execute(function(err, records1) {
        
                                                        let json1={fullName:data.relatedObj[0]};
                                                        json1['layouts']=[];
        
                                                        records1.forEach(ele=>{
                                                            if(ele.NamespacePrefix!=null){
                                                                ele.Name=ele.NamespacePrefix+'__'+ele.Name;
                                                            }
                                                            json1.layouts.push({fullName:ele.Name});
                                                        })
        
                                                        relatedObj.push(json1);

                                                        //For Related 1
                                                        conn.tooling.sobject('QuickActionDefinition')
                                                        .find({SobjectType : data.relatedObj[0]}).select('DeveloperName,NamespacePrefix')
                                                        .execute(function(err, res) {
                                                            
                                                            res.forEach(ele=>{
                                                                
                                                                if(ele.NamespacePrefix!=null&&ele.NamespacePrefix!=undefined){
                                                                    globalQuickActions+='<members>'+data.relatedObj[0]+'.'+ele.NamespacePrefix+'__'+ele.DeveloperName+'</members>';
                                                                }else{
                                                                    globalQuickActions+='<members>'+data.relatedObj[0]+'.'+ele.DeveloperName+'</members>';
                                                                }
                                                                
                                                            })

                                                            //For Related 1
                                                            conn.tooling.sobject('CompactLayout')
                                                            .find({SobjectType :data.relatedObj[0]}).select('DeveloperName,NamespacePrefix')
                                                            .execute(function(err, res) {
                                                                
                                                                res.forEach(ele=>{
                                                                    if(ele.NamespacePrefix!=null&&ele.NamespacePrefix!=undefined){
                                                                        globalCompactLayout+='<members>'+data.relatedObj[0]+'.'+ele.NamespacePrefix+'__'+ele.DeveloperName+'</members>';
                                                                    }else{
                                                                        globalCompactLayout+='<members>'+data.relatedObj[0]+'.'+ele.DeveloperName+'</members>';
                                                                    }
                                                                })

                                                                if(data.relatedObj.length>1){
                
                                                                    conn.query("SELECT id,DurableId, QualifiedApiName FROM EntityDefinition WHERE QualifiedApiName='"+data.relatedObj[1]+"'",function(err,objName3){
                
                                                                        if(objName3.records.length!=0){
                            
                                                                            let obj2=objName3.records[0].DurableId;
                            
                                                                            conn.tooling.sobject('Layout')
                                                                            .find({ TableEnumOrId: obj2 }, "Name,NamespacePrefix")
                                                                            .execute(function(err, records2) {
                            
                                                                                let json2={fullName:data.relatedObj[1]};
                                                                                json2['layouts']=[];
                            
                                                                                records2.forEach(ele=>{
                                                                                    if(ele.NamespacePrefix!=null){
                                                                                        ele.Name=ele.NamespacePrefix+'__'+ele.Name;
                                                                                    }
                                                                                    json2.layouts.push({fullName:ele.Name});
                                                                                })
                
                                                                                relatedObj.push(json2);

                                                                                //Fore Related 2
                                                                                conn.tooling.sobject('QuickActionDefinition')
                                                                                .find({SobjectType : data.relatedObj[1]}).select('DeveloperName,NamespacePrefix')
                                                                                .execute(function(err, res) {
                                                                                    
                                                                                    res.forEach(ele=>{
                                                                                        
                                                                                        if(ele.NamespacePrefix!=null&&ele.NamespacePrefix!=undefined){
                                                                                            globalQuickActions+='<members>'+data.relatedObj[1]+'.'+ele.NamespacePrefix+'__'+ele.DeveloperName+'</members>';
                                                                                        }else{
                                                                                            globalQuickActions+='<members>'+data.relatedObj[1]+'.'+ele.DeveloperName+'</members>';
                                                                                        }
                                                                                        
                                                                                    })

                                                                                    //For Related 2
                                                                                    conn.tooling.sobject('CompactLayout')
                                                                                    .find({SobjectType :data.relatedObj[1]}).select('DeveloperName,NamespacePrefix')
                                                                                    .execute(function(err, res) {
                                                                                        
                                                                                        res.forEach(ele=>{
                                                                                            if(ele.NamespacePrefix!=null&&ele.NamespacePrefix!=undefined){
                                                                                                globalCompactLayout+='<members>'+data.relatedObj[1]+'.'+ele.NamespacePrefix+'__'+ele.DeveloperName+'</members>';
                                                                                            }else{
                                                                                                globalCompactLayout+='<members>'+data.relatedObj[1]+'.'+ele.DeveloperName+'</members>';
                                                                                            }
                                                                                        })

                                                                                        createPackageFile(data, FileName, 'Layout', records, 'layouts',relatedObj,globalQuickActions,globalCompactLayout);
                                                                                    })
                                                                                })
                                                                            })
                            
                                                                        }else{
                                                                            status='Error : No Such Object as '+data.relatedObj[1];
                                                                        }
                                                                    })
                                                                }
                                                                else{
                                                                    createPackageFile(data, FileName, 'Layout', records, 'layouts',relatedObj,globalQuickActions,globalCompactLayout);
                                                                }
                                                            })
                                                        })
                                                    })
                                                }else{
                                                    status='Error : No Such Object as '+data.relatedObj[0];
                                                }
                                            })
                                        }
                                        else if(records!=undefined){
                                            createPackageFile(data, FileName, 'Layout', records, 'layouts',undefined,globalQuickActions,globalCompactLayout);
                                        }else{
                                            status='Error No Records';
                                        }
                                    })
                                })
                                
                                });

                            }
                            else{
                                status='Error : No Such Object as '+data.objUsed;
                            }
                        })
                    }
                    else if(data.Deploy == 'List Views')
                    {
                        console.log('Comparing ListViews');

                        if(metadata.listViews!=undefined){
                            if( metadata.listViews.length !=undefined ){
                                createPackageFile(data, FileName, 'ListView', metadata.listViews, 'objects');
                            }
                            else{
                                let ar=[metadata.listViews];
                                createPackageFile(data, FileName, 'ListView',ar, 'objects');
                            }
                        }else if(metadata.length!=undefined){
                            var sendingAr=[];
                            var relatedObj=[];

                            metadata.forEach(ele=>{
                                if(ele.listViews!=undefined && ele.fullName==data.objUsed){
                                    if(ele.listViews.length!=undefined){
                                        sendingAr=ele.listViews;
                                    }else{
                                        sendingAr.push(ele.listViews);
                                    }
                                }else if(ele.listViews!=undefined){
                                    relatedObj.push(ele);
                                }
                            })
                            if(sendingAr.length!=0){
                                createPackageFile(data, FileName, 'ListView', sendingAr, 'objects',relatedObj);
                            }else{
                                status = 'Error-No listViews';
                            }
                        }
                        else    status = 'Error-No listViews';

                    }else if(data.Deploy == 'Permission Sets/Profile')
                    {
                        console.log('Querying Permission Sets');
                        conn.query( "SELECT Id, Name, Label,NamespacePrefix FROM PermissionSet", function(err, result1) {
                            var changed=[];
                            console.log('Got ',result1.records.length,' Permission...');
                            var gArr = [];
                            if( result1.records.length != 0 ){

                                result1.records.forEach(ele=>{
                                    if(ele.NamespacePrefix!=null){
                                        ele.Name=ele.NamespacePrefix+'__'+ele.Name;
                                    }
                                })

                                for( var val of result1.records ){
                                    if( val.Label != undefined ){
                                        if( !val.Label.startsWith('0') )
                                            gArr.push( val.Name );
                                    }
                                }
                                var conn2 = new jsforce.Connection({
                                    loginUrl : productionLogin
                                });
                                conn2.login(data.CustProductionUserName, data.custPRoductionPassword+data.custProductionSecurtiy, function(err, userInfo) {
                                    if (err) { 
                                        status = 'error Wrong Password or Security Token in Production';
                                        return console.error(err); 
                                    }
                                    conn2.query( "SELECT Id, Name, Label,NamespacePrefix FROM PermissionSet", function(err, result2) {
                                        var pArr = [];
                                        console.log('Got ',result2.records.length,' Permission...');
                                        if( result2.records.length != 0 ){

                                            result2.records.forEach(ele=>{
                                                if(ele.NamespacePrefix!=null){
                                                    ele.Name=ele.NamespacePrefix+'__'+ele.Name;
                                                }
                                            })

                                            for( var val of result2.records ){
                                                if( val.Label != undefined ){
                                                    if( !val.Label.startsWith('0') )
                                                        pArr.push( val.Name );
                                                }
                                            }
                                            for( var v of gArr ){
                                                if( !pArr.includes(v) ){
                                                    changed.push( {label:v, value:'New Permission Set'} );
                                                }
                                            }

                                            console.log('Querying Profile');

                                            conn.query( "SELECT Id, Name FROM Profile", function(err, result1) {
                                                console.log('Got ',result1.records.length,' Profile...');
                                                var gArr = [];
                                                if( result1.records.length != 0 ){
                                                    for( var val of result1.records ){
                                                        gArr.push( val.Name );
                                                    }
                                                    conn2.query( "SELECT Id, Name FROM Profile", function(err, result2) {
                                                        var pArr = [];
                                                        console.log('Got ',result2.records.length,' Group...');
                                                        if( result2.records.length != 0 ){
                                                            for( var val of result2.records ){
                                                                pArr.push( val.Name );
                                                            }
                                                            for( var v of gArr ){
                                                                if( !pArr.includes(v) ){
                                                                    changed.push( {label:v, value:'New Profile'} );
                                                                }
                                                            }
                                                            var fChanged = {};
                                                            fChanged['Compare'] = changed;
                                                            status = fChanged;
                                                        }
                                                    });

                                                    //To Do: Add else
                                                }else{
                                                    var fChanged = {};
                                                    fChanged['Compare'] = changed;
                                                    status = fChanged;
                                                }
                                            });
                                        }
                                    });
                                });
                                //To Do: Add else
                            }else{
                                var fChanged = {};
                                fChanged['Compare'] = changed;
                                status = fChanged;
                            }
                        });
                    }
                    else if(data.Deploy == 'Sharing Settings')
                    {
                        console.log('Comparing Sharing Settings');
                        createPackageFile(data, FileName, 'Settings', undefined, 'sharingRules');
                    }
                    else if(data.Deploy == 'Groups')
                    {
                        console.log('Querying Groups');
                        conn.query( "SELECT Id, DeveloperName, Related.Name, Name FROM Group", function(err, result1) {
                            var changed=[];
                            console.log('Got ',result1.records.length,' Group...');
                            var gArr = [];
                            if( result1.records.length != 0 ){
                                for( var val of result1.records ){
                                    gArr.push( val.DeveloperName );
                                }

                                // createPackageFile(data,FileName,'Group',gArr,'groups');

                                //Fetching prod groups
                                var conn2 = new jsforce.Connection({
                                    loginUrl : productionLogin
                                });
                                


                                conn2.login(data.CustProductionUserName, data.custPRoductionPassword+data.custProductionSecurtiy, function(err, userInfo) {
                                    if (err) { 
                                        status = 'error Wrong Password or Security Token in Production';
                                        return console.error(err); 
                                    }
                                    conn2.query( "SELECT Id, DeveloperName, Related.Name, Name FROM Group", function(err, result2) {
                                        var pArr = [];
                                        if( result2.records.length != 0 ){
                                            for( var val of result2.records ){
                                                pArr.push( val.DeveloperName );
                                            }
                                            for( var v of gArr ){
                                                if( !pArr.includes(v) && v!='Config_Item_Site' && v!='Config_Item'){
                                                    changed.push( {label:v, value:'New Group'} );
                                                }
                                            }
                                        }
                                        var fChanged = {};
                                        fChanged['Compare'] = changed;
                                        status = fChanged;
                                    });
                                });
                            }else{
                                var fChanged = {};
                                fChanged['Compare'] = changed;
                                status = fChanged;
                            }
                        });
                    }
                    else if(data.Deploy == 'Custom Settings')
                    {
                        conn.query( "SELECT Id, Label, MasterLabel, PluralLabel, DeveloperName, QualifiedApiName, KeyPrefix, NamespacePrefix FROM EntityDefinition WHERE IsCustomSetting = true", function(err, result1) {
                            var changed=[];
                            console.log('Got ',result1.records.length,' Custom Settings...');
                            var gArr = [];
                            if( result1.records.length != 0 ){

                                result1.records.forEach(ele=>{
                                    if(ele.NamespacePrefix!=null){
                                        ele.DeveloperName=ele.NamespacePrefix+'__'+ele.DeveloperName;
                                    }
                                })

                                for( var val of result1.records ){
                                    gArr.push( val.QualifiedApiName );
                                }
                                //Fetching prod groups
                                var conn2 = new jsforce.Connection({
                                    loginUrl : productionLogin
                                });
                                conn2.login(data.CustProductionUserName, data.custPRoductionPassword+data.custProductionSecurtiy, function(err, userInfo) {
                                    if (err) { 
                                        status = 'error Wrong Password or Security Token in Production';
                                        return console.error(err); 
                                    }
                                    conn2.query( "SELECT Id, Label, MasterLabel, PluralLabel, DeveloperName, QualifiedApiName, KeyPrefix, NamespacePrefix FROM EntityDefinition WHERE IsCustomSetting = true", function(err, result2) {
                                        var pArr = [];
                                        if( result2.records.length != undefined ){

                                            result2.records.forEach(ele=>{
                                                if(ele.NamespacePrefix!=null){
                                                    ele.DeveloperName=ele.NamespacePrefix+'__'+ele.DeveloperName;
                                                }
                                            })

                                            for( var val of result2.records ){
                                                pArr.push( val.QualifiedApiName );
                                            }
                                            for( var v of gArr ){
                                                if( !pArr.includes(v) ){
                                                    changed.push( {label:v, value:'New Custom Setting'} );
                                                }
                                            }
                                        }
                                        var fChanged = {};
                                        fChanged['Compare'] = changed;
                                        status = fChanged;
                                    });
                                });
                                //To Do: Add else
                            }else{
                                var fChanged = {};
                                fChanged['Compare'] = changed;
                                status = fChanged;
                            }
                        });
                    }
                    else if(data.Deploy == 'Reports')
                    {
                        console.log('Getting Reports');
                        conn.query( "SELECT Name,Id,DeveloperName,FolderName,NamespacePrefix FROM Report where FolderName!='Private Reports' ", function(err, result1) {
                            var changed=[];
                            console.log('Got ',result1.records.length,' Reports...');
                            var gArr = [];
                            if( result1.records.length != 0 ){

                                result1.records.forEach(ele=>{
                                    if(ele.NamespacePrefix!=null){
                                        ele.Name=ele.NamespacePrefix+'__'+ele.Name;
                                    }
                                })

                                for( var val of result1.records ){
                                    gArr.push( val.DeveloperName );
                                }
                                var conn2 = new jsforce.Connection({
                                    loginUrl : productionLogin
                                });
                                conn2.login(data.CustProductionUserName, data.custPRoductionPassword+data.custProductionSecurtiy, function(err, userInfo) {
                                    if (err) { 
                                        status = 'error Wrong Password or Security Token in Production';
                                        return console.error(err); 
                                    }
                                    conn2.query( "SELECT Name,Id,DeveloperName,FolderName,NamespacePrefix FROM Report where FolderName!='Private Reports'", function(err, result2) {
                                        var pArr = [];
                                        if( result2.records.length != 0 ){

                                            result2.records.forEach(ele=>{
                                                if(ele.NamespacePrefix!=null){
                                                    ele.Name=ele.NamespacePrefix+'__'+ele.Name;
                                                }
                                            })

                                            for( var val of result2.records ){
                                                pArr.push( val.DeveloperName );
                                            }
                                            for( var v of gArr ){
                                                if( !pArr.includes(v) ){
                                                    changed.push( {label:v, value:'New Reports'} );
                                                }
                                            }
                                        }
                                        var fChanged = {};
                                        fChanged['Compare'] = changed;
                                        status = fChanged;
                                    });
                                });
                            }else{
                                var fChanged = {};
                                fChanged['Compare'] = changed;
                                status = fChanged;
                            }
                        });
                    }else if(data.Deploy == 'Dashboard')
                    {
                        console.log('Getting Reports');
                        conn.query( "SELECT Title,DeveloperName,FolderName,NamespacePrefix FROM Dashboard where FolderName!='Private Dashboards' ", function(err, result1) {
                            var changed=[];
                            console.log('Got ',result1.records.length,' Dashboards...');
                            var gArr = [];
                            if( result1.records.length != 0 ){

                                result1.records.forEach(ele=>{
                                    if(ele.NamespacePrefix!=null){
                                        ele.Name=ele.NamespacePrefix+'__'+ele.Name;
                                    }
                                })

                                for( var val of result1.records ){
                                    gArr.push( {name:val.DeveloperName,value:val.Title} );
                                }
                                //Fetching prod groups
                                var conn2 = new jsforce.Connection({
                                    loginUrl : productionLogin
                                });
                                conn2.login(data.CustProductionUserName, data.custPRoductionPassword+data.custProductionSecurtiy, function(err, userInfo) {
                                    if (err) { 
                                        status = 'error Wrong Password or Security Token in Production';
                                        return console.error(err); 
                                    }
                                    conn2.query( "SELECT DeveloperName,FolderName,NamespacePrefix FROM Dashboard where FolderName!='Private Dashboards' ", function(err, result2) {
                                        var pArr = [];
                                        if( result2.records.length != 0 ){

                                            result1.records.forEach(ele=>{
                                                if(ele.NamespacePrefix!=null){
                                                    ele.Name=ele.NamespacePrefix+'__'+ele.Name;
                                                }
                                            })

                                            for( var val of result2.records ){
                                                pArr.push( val.DeveloperName );
                                            }
                                            for( var v of gArr ){
                                                if( !pArr.includes(v.name) ){
                                                    changed.push( {label:v.value, value:'New Dashboard'} );
                                                }
                                            }
                                        }
                                        var fChanged = {};
                                        fChanged['Compare'] = changed;
                                        status = fChanged;
                                    });
                                });
                                //To Do: Add else
                            }else{
                                var fChanged = {};
                                fChanged['Compare'] = changed;
                                status = fChanged;
                            }
                        });
                    }
                }
            });
        });
    } );
    async function createPackageFile(data,FileName,config, configValues, cName, relatedObj,quickActions,compactLayout)
    {

        try{
            //Creating package.xml file
            var e = createPackageXmlFile( data, FileName, configValues, config ,undefined,relatedObj,quickActions,compactLayout);
            if( e != 'error' ){
                //Retrieving configs from sandbox and prod
                const res = await backupData( data.userName, data.password, data.sToken, data.orgId, FileName );
                const res2 = await backupData( data.CustProductionUserName, data.custPRoductionPassword, data.custProductionSecurtiy, data.orgId, FileName, undefined, true );
                const archiver = require('archiver');
                //Unzipping the zip file
                
                if(fs.existsSync(FileName+'prod.zip')){
                    fs.createReadStream(FileName+'prod.zip')
                    .pipe(
                        unzipper.Extract({ path: './' })
                    );


                    let timeout=40000;
                    if(config=='Settings'){
                        timeout=60000;
                    }
                    setTimeout( ()=>{
                        prodSandboxJSONMap( cName, FileName, config, data.objUsed);
                    },timeout);
                }
            }
        }catch( er ){
            status = 'Error-'+er;
            console.log(er);
        }
    }
    async function createPackageXmlFile( data, FileName, configValues, config ,folderMap,relatedObj,quickActions,compactLayout ){
        try{
            var stream = fs.createWriteStream(FileName+".xml");
            var members='';
            if( configValues != undefined ){
                for( var val of configValues ){
                    if( config == 'Layout' ){
                        members+='<members>'+data.objUsed+'-'+val.Name+'</members>';    
                    }else if( data.Deploy == 'FinalCustomSettings' || config == 'Group' || config == 'PermissionSet' ){
                        if( val.startsWith(' ') ){
                            val = val.replace( ' ', '' );
                        }
                        members+='<members>'+val+'</members>';    
                    }else if(config == 'Profile'||config=='FlexiPage'){

                        members+='<members>'+val+'</members>';    

                    }else   members+='<members>'+data.objUsed+'.'+val.fullName+'</members>';
                }
            }
            if(relatedObj!=undefined){
                relatedObj.forEach(ele=>{       
                    if(data.Deploy == 'Fields'){
                        if(ele.fields.length!=undefined){

                            ele.fields.forEach(val=>{
                                members+='<members>'+ele.fullName+'.'+val.fullName+'</members>';
                            })

                        }else{
                            members+='<members>'+ele.fullName+'.'+ele.fields.fullName+'</members>';
                        }
                    }else if(data.Deploy == 'List Views'){
                        
                        if(ele.listViews.length!=undefined){

                            ele.listViews.forEach(val=>{
                                members+='<members>'+ele.fullName+'.'+val.fullName+'</members>';
                            })

                        }else{
                            members+='<members>'+ele.fullName+'.'+ele.listViews.fullName+'</members>';
                        }
                    }else if(data.Deploy == 'Layout'){

                        if(ele.layouts.length!=undefined){

                            ele.layouts.forEach(val=>{
                                members+='<members>'+ele.fullName+'-'+val.fullName+'</members>';
                            })

                        }else{
                            members+='<members>'+ele.fullName+'-'+ele.layouts.fullName+'</members>';
                        }
                    }
                })
            }

            stream.once('open', function(fd) {
            var types;
            if( config == 'Settings' ){
                types = `<types>
                            <members>${data.objUsed}.*</members>
                            <name>SharingCriteriaRule</name>
                        </types>
                        <types>
                            <members>${data.objUsed}.*</members>
                            <name>SharingOwnerRule</name>
                        </types>
                        <types>
                            <members>${data.objUsed}</members>
                            <name>CustomObject</name>
                        </types>`;
                data.relatedObj.forEach(ele=>{
                    types+=`<types>
                                <members>${ele}.*</members>
                                <name>SharingCriteriaRule</name>
                            </types>
                            <types>
                                <members>${ele}.*</members>
                                <name>SharingOwnerRule</name>
                            </types>
                            <types>
                                <members>${ele}</members>
                                <name>CustomObject</name>
                            </types>`;
                })
            }else if(config == 'PermissionSet'){
                types = `<types>
                            ${members}
                            <name>${config}</name>
                        </types>`
            }else if(config == 'Profile'){
                types = `<types>
                            ${members}
                            <name>${config}</name>
                        </types>`
            }else if(config=='Dashboard'){

                    types=`<types>`;
                    var k=Object.keys(folderMap);
                    k.forEach(ele=>{
                        let key=folderMap[ele];
                        key.forEach(rep=>{
                            types+=`<members>${ele}/${rep.DeveloperName}</members>`;
                        })
                    })
                    types+=`<name>Dashboard</name>
                            </types>`;
                
            }else if(config == 'Reports'){
                
                
                    types=`<types>`;
                    var k=Object.keys(folderMap);
                    k.forEach(ele=>{
                        let key=folderMap[ele];
                        key.forEach(rep=>{
                            types+=`<members>${ele}/${rep.DeveloperName}</members>`;
                        })
                    })
                    types+=`<name>Report</name>
                            </types>`;
                
            }else if( members!='' ){
                types = `<types>
                            ${members}
                            <name>${config}</name>
                        </types>`;
            }else{
                status='Error-No items found';
                return 'error';
            }

            if(data.Deploy == 'Layout'){

                types+=`<types>
                        ${quickActions}
                        <name>QuickAction</name>
                        </types>
                        <types>
                        ${compactLayout}
                        <name>CompactLayout</name>
                        </types>`;
            }

            globalContent=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <Package xmlns="http://soap.sforce.com/2006/04/metadata">
            ${types}
            <version>55.0</version>
            </Package>`;
            stream.write(
                globalContent
            );
            stream.end();
            });
        }catch( err ){
            status = 'Error-'+err;
            console.log('Error:',err);
            return err;
        }
    }


    function fetchGlobalItems( data ){
        var conn = new jsforce.Connection({
            loginUrl : 'https://test.salesforce.com'
        });
        var conn2 = new jsforce.Connection({
            loginUrl : productionLogin
        });
        // 'cyntexa2@dev2.com', 'Cyntexa@123b6sl1HwJ692lCjCPachYx2eA'
        conn.login(data.userName, data.password+data.sToken, function(err, userInfo) {
            if (err) { 
                status = 'error Wrong Password or Security Token in Sandbox';
                return console.error(err); 
            }
            var mData={};
            console.log('Fetching Groups');
            conn.query( "SELECT Id, DeveloperName, Related.Name, Name FROM Group", function(err, result1) {
                if(result1.records!= undefined){
                    let gArr=[];
                    result1.records.forEach(val=>{
                        if( val.Related != undefined ){
                            if( val.Related.Name != 'Config Item Site Guest User' && val.Related.Name != 'Config Item Site Site Guest User' )
                                gArr.push( val.DeveloperName );
                        }else{
                            gArr.push( val.DeveloperName );
                        }
                    })

                    let set=new Set(gArr);
                    gArr=[];
                    gArr=Array.from(set);
                    mData['group']=gArr;
                }
                console.log('Fetching Permission Set');
                conn.query( "SELECT Id, Name, Label,NamespacePrefix FROM PermissionSet", function(err, resultP) {
                    if( resultP.records != undefined ){
                        let pArr=[];

                        resultP.records.forEach(ele=>{
                            if(ele.NamespacePrefix!=null){
                                ele.Name=ele.NamespacePrefix+'__'+ele.Name;
                            }
                        })

                        resultP.records.forEach(ele=>{
                            if(ele.Label!=undefined)
                            {
                                if( !ele.Label.startsWith('0') )
                                pArr.push(ele);
                            }
                        })
                        mData['pSet']=pArr; 
                    }
                    console.log('Fetching Reports');
                    conn.query( "SELECT Name,Id,DeveloperName,FolderName,NamespacePrefix FROM Report where FolderName!='Private Reports'", function(err, resultPr) {

                        resultPr.records.forEach(ele=>{
                            if(ele.NamespacePrefix!=null){
                                ele.DeveloperName=ele.NamespacePrefix+'__'+ele.DeveloperName;
                            }
                        })

                        mData['report']=resultPr.records;

                        console.log('Fetching Dashboard');
                        conn.query( "SELECT Title,Id,DeveloperName,FolderName,NamespacePrefix FROM Dashboard where FolderName!='Private Dashboards'", function(err, resultPd) {

                            resultPd.records.forEach(ele=>{
                                if(ele.NamespacePrefix!=null){
                                    ele.DeveloperName=ele.NamespacePrefix+'__'+ele.DeveloperName;
                                }
                            })

                            mData['dashboard']=resultPd.records;

                            console.log('Fetching Custom Settings');
                            conn.query('SELECT Id, Label, MasterLabel, PluralLabel, DeveloperName, QualifiedApiName, KeyPrefix, NamespacePrefix FROM EntityDefinition WHERE IsCustomSetting = true Order by QualifiedApiName',function(err,resultCS){

                                resultCS.records.forEach(ele=>{
                                    if(ele.NamespacePrefix!=null){
                                        ele.DeveloperName=ele.NamespacePrefix+'__'+ele.DeveloperName;
                                    }
                                })

                                mData['customsetting']=resultCS.records;
                                console.log('Fetching Profiles');
                                conn.query('SELECT Name,Id FROM Profile',function(err,resultPro){
                                    mData['profile']=resultPro.records;
                                    conn2.login(data.CustProductionUserName, data.custPRoductionPassword+data.custProductionSecurtiy, function(err, userInfo) {
                                        if (err) { 
                                            status = 'error Wrong Password or Security Token in Production';
                                            return console.error(err); 
                                        }
                                        getRelatedTask( data, conn, conn2, mData, 'Entire' );
                                    });
                                })
                            })
                        });
                    });
                });
            });
        });
    }

    async function changeFolderXml(FileName, config, cName , folderMap,folContent,data,dash,members){
        try{

            if (fs.existsSync(FileName+'.zip')) {
                const fs = require('fs');
                const unzipper = require( 'unzipper' );
                fs.createReadStream(FileName+'.zip')
                .pipe(
                    unzipper.Extract({ path: './' })
                );
            }

            setTimeout( async ()=>{
                var fs = require('fs');
                
                if(fs.existsSync("./unpackaged/package.xml")){

                    var stream = fs.createWriteStream("./unpackaged/package.xml");
                    await stream.once('open', async function(fd) {
    
                        stream.write( folContent );
                        stream.end();
        
                        if(config=='Reports')
                        {
                            
                            var key=Object.keys(folderMap);
                            await key.forEach(async function(k){
    
    
                                if(k!='unfiled$public'){
                                    
                                    if (fs.existsSync("./unpackaged/reports/"+k+"-meta.xml")) {

                                        var stream1 = fs.createWriteStream("./unpackaged/reports/"+k+"-meta.xml");
                                        await stream1.once('open',async function(fd) {
                                            stream1.write( 
                
                                                `<ReportFolder xmlns="http://soap.sforce.com/2006/04/metadata">
                                                    <accessType>Public</accessType>
                                                        <name>${k}</name>
                                                    <publicFolderAccess>ReadWrite</publicFolderAccess>
                                                </ReportFolder>`
                                                
                                            );
                                            stream1.end();
                                            if(fs.existsSync(FileName+'.zip')){
                                                const output = fs.createWriteStream(FileName+'.zip');
                                                const archive = archiver('zip', {
                                                    zlib: { level: 9 } // Sets the compression level.
                                                });
                                                archive.pipe(output);
                                                archive.directory('./unpackaged', 'unpackaged');
                                                archive.finalize();
                                            }    
                                        });

                                    }
                                }
    
                            });
                            status = 'Deploying Configurations';
                            const r = await deployData( data.CustProductionUserName, data.custPRoductionPassword, data.custProductionSecurtiy, data.sandboxId, FileName );
                            console.log('Deploy Result 1: ',r);
                            if( r == 'Deploy' ){
                                status = 'Completed';
                            }else{
                                status = r+' error';
                            }
                            
                            createFile(data, FileName, 'Reports',undefined, 'reports',folderMap,dash);                            
                            console.log('Reports Folder Complete');
                            return 'done';
                        }
                        else if(config=='Dashboard')
                        {
                            
                            var key=Object.keys(folderMap);
                            await key.forEach(async function(k){

                                if (fs.existsSync("./unpackaged/dashboards/"+k+"-meta.xml")) {

                                    var stream1 = fs.createWriteStream("./unpackaged/dashboards/"+k+"-meta.xml");
                                    await stream1.once('open',async function(fd) {
                                        stream1.write( 
            
                                            `<DashboardFolder xmlns="http://soap.sforce.com/2006/04/metadata">
                                                <accessType>Public</accessType>
                                                    <name>${k}</name>
                                                <publicFolderAccess>ReadWrite</publicFolderAccess>
                                            </DashboardFolder>`
                                            
                                        );
                                        stream1.end();
        
                                        if(fs.existsSync(FileName+'.zip')){
                                            const output = fs.createWriteStream(FileName+'.zip');
                                            const archive = archiver('zip', {
                                                zlib: { level: 9 } // Sets the compression level.
                                            });
                                            archive.pipe(output);
                                            archive.directory('./unpackaged', 'unpackaged');
                                            archive.finalize();
                                        }
        
        
                                    }); 
                                }

                            });
                            status = 'Deploying Configurations';
                            const r = await deployData( data.CustProductionUserName, data.custPRoductionPassword, data.custProductionSecurtiy, data.sandboxId, FileName );
                            console.log('Deploy Result 2: ',r);
                            if( r == 'Deploy' ){
                                status = 'Completed';   
                            }else{
                                status = r+' error';
                            }
                            createFile(data, FileName, 'Dashboard',undefined, 'dashboards',folderMap);
                            return 'done';
                        }
                    });
                }

            },1000 );
        }catch( err ){
            console.log(err);
        }    
    }
    
    async function entireDeployxml(data,fileName){

        if (fs.existsSync('package.xml')) {
            
            globalContent=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <Package xmlns="http://soap.sforce.com/2006/04/metadata">
            ${globalMembers}
            <version>55.0</version>
            </Package>`

            var stream = fs.createWriteStream('./package.xml');
            await stream.once('open', async function(fd) {
                
                stream.write(
                    globalContent
                    );
                    
                    console.log('Retiving Entire');
                    
                    setTimeout(async () => {
                        
                        const r=await backupData( data.userName, data.password, data.sToken, data.orgId, fileName, 'package' ,undefined);
                        
                        if(r=='Success')
                        {
                            console.log('Retrived');

                            if (fs.existsSync(fileName+'.zip')) {
                    
                                const unzipper = require( 'unzipper' );
                                const archiver = require('archiver');
                                fs.createReadStream(fileName+'.zip')
                                .pipe(
                                    unzipper.Extract({ path: './' })
                                );
                    
                                setTimeout(async () => {
                    
                                    if(fs.existsSync('./unpackaged/package.xml')){

                                        var stream = fs.createWriteStream('./unpackaged/package.xml');
                                        stream.once('open', async function(fd) {
                        
                                            stream.write(
                                                globalContent
                                            );
                                            stream.end();
                                        })
                        
                                        setTimeout(() => {
                                            const output = fs.createWriteStream(fileName+'.zip');
                                            const archive = archiver('zip', {
                                                zlib: { level: 9 } // Sets the compression level.
                                            });
                                            archive.pipe(output);
                                            archive.directory('./unpackaged', 'unpackaged');
                                            archive.finalize();
                                            
                            
                            
                                            setTimeout(async () => {
                                                const r = await deployData( data.CustProductionUserName, data.custPRoductionPassword, data.custProductionSecurtiy, data.sandboxId, fileName );
                                                
                                                console.log('Deploy Resullt : ',r);
                                                if( r == 'Deploy' ){
                                                    var type = '(';
                                                    if( data.Entire.Task != undefined ){
                                                        var gNames = data.Entire.Task.toString();
                                                        gNames = gNames.replaceAll( '[', '' );
                                                        gNames = gNames.replaceAll( ']', '' );
                                                        var g = gNames.split(',');
                                                        for( var val of g ){
                                                            type+='\''+val+'\',';
                                                        }
                                                    }
                                                    if( type.length > 1 )
                                                        type = type.slice(0, -1);
                                                    type+=')';
                                                    deployComplianceRecords(data,type);
                                                }else{
                                                    status=r+' error';
                                                }
                                            }, 1000);
                                        }, 5000);
                                    }
                                }, 5000);
                            }
                        }
                }, 10000);
                stream.end();
            });
        }
    }
    
    async function deployEntire(data,fileName)
    {
        console.log('Creating package');
        var ent=data.Entire;

        let conn = new jsforce.Connection({
            loginUrl : 'https://test.salesforce.com'
        });
        let members='';
        globalMembers='';


        conn.login(data.userName, data.password+data.sToken, async function(err, userInfo) {
            if (err) { 
                status = 'error Wrong Password or Security Token in Sandbox';
                return console.error(err); 
            }

            
                globalMembers+='<types>\n';
                globalMembers+='<members>'+data.objUsed+'</members>\n';
                
                data.relatedObj.forEach(ele=>{
                    globalMembers+='<members>'+ele+'</members>\n';
                })

                globalMembers+=`<name>CustomObject</name>
                                </types>
                                `;


                globalMembers += `
                            <types>
                                <members>${data.objUsed}.*</members>
                                <name>SharingCriteriaRule</name>
                            </types>
                            <types>
                                <members>${data.objUsed}.*</members>
                                <name>SharingOwnerRule</name>
                            </types>
                            <types>
                                <members>${data.objUsed}</members>
                                <name>CustomObject</name>
                            </types>
                            `;
                            
                data.relatedObj.forEach(ele=>{

                    globalMembers +=`
                                    <types>
                                        <members>${ele}.*</members>
                                        <name>SharingCriteriaRule</name>
                                    </types>
                                    <types>
                                        <members>${ele}.*</members>
                                        <name>SharingOwnerRule</name>
                                    </types>
                                    <types>
                                        <members>${ele}</members>
                                        <name>CustomObject</name>
                                    </types>
                                    `;
                })

                var layoutQuery="SELECT id,DurableId, QualifiedApiName FROM EntityDefinition WHERE QualifiedApiName='"+data.objUsed+"'";

                data.relatedObj.forEach(ele=>{
                    layoutQuery+=" OR QualifiedApiName='"+ele+"'";
                })
                conn.query(layoutQuery,function(err,objName1){
                    let obj=[];
                    let objMap={};
                    let objKeys=[];

                    objName1.records.forEach(ele=>{
                        objMap[ele.DurableId]=ele.QualifiedApiName;
                        objKeys.push(ele.QualifiedApiName);
                        obj.push(ele.DurableId);
                    })

                    conn.tooling.sobject('Layout')
                    .find({ TableEnumOrId: obj }, "Name,NamespacePrefix,TableEnumOrId")
                    .execute(function(err, records) {

                        records.forEach(ele=>{
                            if(ele.NamespacePrefix!=null){
                                ele.TableEnumOrId=ele.TableEnumOrId.substring(0,15);
                                ele.Name=ele.NamespacePrefix+'__'+ele.Name;   
                            }
                        })

                        globalMembers+='<types>\n';
                        records.forEach(ele=>{
                            globalMembers+=`<members>${objMap[ele.TableEnumOrId]}-${ele.Name}</members>
                            `
                        })
                        globalMembers+=`<name>Layout</name>
                                        </types>
                                        `;

                        conn.tooling.sobject('QuickActionDefinition')
                        .find({SobjectType : objKeys}).select('DeveloperName,NamespacePrefix,SobjectType')
                        .execute(function(err, res) {
                            globalMembers+='<types>\n';
                            res.forEach(ele=>{
                                if(ele.NamespacePrefix!=null){
                                    globalMembers+=`<members>${ele.SobjectType}.${ele.NamespacePrefix}__${ele.DeveloperName}</members>
                                    `;
                                }else{
                                    globalMembers+=`<members>${ele.SobjectType}.${ele.DeveloperName}</members>
                                    `;
                                }
                            })
                            globalMembers+=`<name>QuickAction</name>
                                            </types>
                                            `;
                            conn.tooling.sobject('CompactLayout')
                            .find({SobjectType : objKeys }).select('DeveloperName,NamespacePrefix,SobjectType')
                            .execute(function(err, res) {
                                
                                globalMembers+='<types>\n';

                                res.forEach(ele=>{
                                    if(ele.NamespacePrefix!=null){
                                        globalMembers+=`<members>${ele.SobjectType}.${ele.NamespacePrefix}__${ele.DeveloperName}</members>
                                        `;
                                    }else{
                                        globalMembers+=`<members>${ele.SobjectType}.${ele.DeveloperName}</members>
                                        `;
                                    }
                                })
                                globalMembers+=`<name>CompactLayout</name>
                                                </types>
                                                `;
                                conn.tooling.sobject('FlexiPage').find({ EntityDefinitionId : obj ,Type:"RecordPage"}).select('DeveloperName,MasterLabel,EntityDefinitionId,Type,NamespacePrefix').execute(function(err, records) {
                                    if(err){
                                        console.log(err);
                                    }
                                    let ar=[];
                                    if(records!=undefined){
                                        if(records.length!=undefined){
        
                                            records.forEach(ele=>{
                                                if(ele.NamespacePrefix!=null){
                                                    ele.DeveloperName=ele.NamespacePrefix+'__'+ele.DeveloperName;
                                                }
                                            })
            
                                            globalMembers+=`<types>
                                            `
            
                                            records.forEach(ele=>{
                                                globalMembers+=`<members>${ele.DeveloperName}</members>
                                                `
                                            })
            
                                            globalMembers+=`<name>FlexiPage</name>
                                                            </types>`
            
            
                                            if(ent.CustomSetting.length!=0)
                                            {
                                                let types=''
                                                types+=`<types>
                                                `;
                                                ent.CustomSetting.forEach(ele=>{
                                                    types+=`<members>${ele}</members>
                                                    `;
                                                });
                                                types+=`<name>CustomObject</name>
                                                        </types>
                                                        `;
                                                globalMembers+=types;
                                            }
                                    
                                            //Getting Entire Profile
                                            if(ent.ProFile.length!=0)
                                            {
                                                let types=''
                                                types+=`<types>
                                                `;
                                                ent.ProFile.forEach(ele=>{
                                                    types+=`<members>${ele}</members>
                                                    `;
                                                });
                                                types+=`<name>Profile</name>
                                                        </types>
                                                        `;
                                                globalMembers+=types;
                                            }
                                    
                                            //Getting Entire Group
                                            if(ent.Group.length!=0)
                                            {
                                                let types=''
                                                types+=`<types>
                                                `;
                                                ent.Group.forEach(ele=>{
                                                    types+=`<members>${ele}</members>
                                                    `;
                                                });
                                                types+=`<name>Group</name>
                                                        </types>
                                                        `;
                                                globalMembers+=types;
                                            }
                                    
                                            //Getting Entire Permission
                                            if(ent.Permission.length!=0)
                                            {
                                                let types='';
                                                types+=`<types>
                                                `;
                                                ent.Permission.forEach(ele=>{
                                                    types+=`<members>${ele}</members>
                                                    `;
                                                });
                                                types+=`<name>PermissionSet</name>
                                                        </types>
                                                        `;
                                                globalMembers+=types;
                                            }
                                    
                                    
                                        
                                            
                                    
                                                //EntireDashboard With EntireReports
                                                if(ent.Dashboard.length!=0)
                                                {
                                                    var folDas={};
                                                    
                                                    conn.query('SELECT Id,DeveloperName,FolderName,NamespacePrefix FROM Dashboard',async function(err,result){
                                                        var dashBoard=result.records;
                                    
                                                        dashBoard.forEach(ele=>{
                                                            if(ele.NamespacePrefix!=null){
                                                                ele.DeveloperName=ele.NamespacePrefix+'__'+ele.DeveloperName;
                                                            }
                                                        })
                                    
                                                        if(err)
                                                        {
                                                            console.log(err);
                                                        }
                                                        conn.query('SELECT Id,Name,DeveloperName,NamespacePrefix FROM Folder',async function(err,result){
                                    
                                                            if(err)
                                                            {
                                                                console.log(err);
                                                            }
                                                            var fol=result.records;
                                    
                                                            fol.forEach(ele=>{
                                                                if(ele.NamespacePrefix!=null){
                                                                    ele.DeveloperName=ele.NamespacePrefix+'__'+ele.DeveloperName;
                                                                }
                                                            })
                                                            let rep={};
                                                            dashBoard.forEach(d=>{
                                                                if(ent.Dashboard.includes(d.DeveloperName))
                                                                {
                                                                    if(rep[d.FolderName]!=null&&rep[d.FolderName]!=undefined)
                                                                    {
                                                                        let temp=rep[d.FolderName];
                                                                        temp.push(d);
                                                                        rep[d.FolderName]=temp;
                                                                    }
                                                                    else
                                                                    {
                                                                        let temp=[];
                                                                        temp.push(d);
                                                                        rep[d.FolderName]=temp;
                                                                    }
                                                                }
                                                            });
                                    
                                                            fol.forEach(f=>{
                                                                if(rep[f.Name]!=null)
                                                                {
                                                                    folDas[f.DeveloperName]=rep[f.Name];
                                                                }
                                                            })
                                                            types=`<types>
                                                            `;
                                                            var k=Object.keys(folDas);
                                                            k.forEach(ele=>{
                                                                
                                                                types+=`<members>${ele}</members>
                                                                `;
                                    
                                                                let key=folDas[ele];
                                                                key.forEach(rep=>{
                                                                    types+=`<members>${ele}/${rep.DeveloperName}</members>
                                                                    `;
                                                                })
                                                                
                                                            })
                                                            types+=`<name>Dashboard</name>
                                                                    </types>
                                                                    `;
                                                                    

                                    
                                                            //Getting Entire Reports
                                                            if(ent.Report.length!=0){
                                    
                                                                var types=''
                                                                var folRep={};
                                                
                                                                conn.query('SELECT Name,Id,DeveloperName,FolderName,NamespacePrefix FROM Report  ',async function(err,result){
                                                                    var reports=result.records;
                                    
                                                                    reports.forEach(ele=>{
                                                                        if(ele.NamespacePrefix!=null){
                                                                            ele.DeveloperName=ele.NamespacePrefix+'__'+ele.DeveloperName;
                                                                        }
                                                                    })
                                    
                                                                    if(err)
                                                                    {
                                                                        console.log(err);
                                                                    }
                                                                    conn.query('SELECT Id,Name,DeveloperName,NamespacePrefix FROM Folder ',async function(err,result){
                                        
                                                                        if(err)
                                                                        {
                                                                            console.log(err);
                                                                        }
                                                                        var fol=result.records;
                                    
                                                                        fol.forEach(ele=>{
                                                                            if(ele.NamespacePrefix!=null){
                                                                                ele.DeveloperName=ele.NamespacePrefix+'__'+ele.DeveloperName;
                                                                            }
                                                                        })
                                                
                                                                        let rep={};
                                                                        reports.forEach(r=>{
                                                                            if(ent.Report.includes(r.DeveloperName))
                                                                            {
                                                                                if(r.FolderName=='Public Reports'){
                                                
                                                                                    if(rep['unfiled$public']!=null&&rep['unfiled$public']!=undefined)
                                                                                    {
                                                                                        let temp=rep['unfiled$public'];
                                                                                        temp.push(r);
                                                                                        rep['unfiled$public']=temp;
                                                                                    }
                                                                                    else
                                                                                    {
                                                                                        let temp=[];
                                                                                        temp.push(r);
                                                                                        rep['unfiled$public']=temp;
                                                                                    }
                                                                                }
                                                                                else if(rep[r.FolderName]!=null&&rep[r.FolderName]!=undefined)
                                                                                {
                                                                                    let temp=rep[r.FolderName];
                                                                                    temp.push(r);
                                                                                    rep[r.FolderName]=temp;
                                                                                }
                                                                                else
                                                                                {
                                                                                    let temp=[];
                                                                                    temp.push(r);
                                                                                    rep[r.FolderName]=temp;
                                                                                }
                                                                            }
                                                                        });
                                                
                                                                        fol.forEach(f=>{
                                                                            if(rep[f.Name]!=null)
                                                                            {
                                                                                folRep[f.DeveloperName]=rep[f.Name];
                                                                            }
                                                                        })
                                                
                                                                        if(rep['unfiled$public']!=null&&rep['unfiled$public']!=undefined){
                                                                            folRep['unfiled$public']=rep['unfiled$public'];
                                                                        }
                                    
                                                                        createFolder(data, fileName, 'Reports',undefined, 'reports',folRep,folDas,members);  
                                                                    })
                                                                })
                                                            }
                                                            else{
                                                                createFolder(data, fileName, 'Dashboard',undefined, 'dashboards',folDas,undefined,members);
                                                            }
                                                        })
                                                    })
                                                }
                                                //EntireRreport
                                                else if(ent.Report.length!=0){
                                    
                                                    var types=''
                                    
                                                    var folRep={};
                                    
                                                    conn.query('SELECT Name,Id,DeveloperName,FolderName,NamespacePrefix FROM Report  ',async function(err,result){
                                                        
                                                        var reports=result.records;
                                    
                                                        reports.forEach(ele=>{
                                                            if(ele.NamespacePrefix!=null){
                                                                ele.DeveloperName=ele.NamespacePrefix+'__'+ele.DeveloperName;
                                                            }
                                                        })
                                                        if(err)
                                                        {
                                                            console.log(err);
                                                        }
                                                        conn.query('SELECT Id,Name,DeveloperName,NamespacePrefix FROM Folder ',async function(err,result){
                                        
                                                            if(err)
                                                            {
                                                                console.log(err);
                                                            }
                                                            var fol=result.records;
                                    
                                                            fol.forEach(ele=>{
                                                                if(ele.NamespacePrefix!=null){
                                                                    ele.DeveloperName=ele.NamespacePrefix+'__'+ele.DeveloperName;
                                                                }
                                                            })
                                    
                                                            let rep={};
                                                            reports.forEach(r=>{
                                                                if(ent.Report.includes(r.DeveloperName))
                                                                {
                                                                    
                                                                    if(r.FolderName=='Public Reports'){
                                    
                                                                        if(rep['unfiled$public']!=null&&rep['unfiled$public']!=undefined)
                                                                        {
                                                                            let temp=rep['unfiled$public'];
                                                                            temp.push(r);
                                                                            rep['unfiled$public']=temp;
                                                                        }
                                                                        else
                                                                        {
                                                                            let temp=[];
                                                                            temp.push(r);
                                                                            rep['unfiled$public']=temp;
                                                                        }
                                                                    }
                                                                    else if(rep[r.FolderName]!=null&&rep[r.FolderName]!=undefined)
                                                                    {
                                                                        let temp=rep[r.FolderName];
                                                                        temp.push(r);
                                                                        rep[r.FolderName]=temp;
                                                                    }
                                                                    else
                                                                    {
                                                                        let temp=[];
                                                                        temp.push(r);
                                                                        rep[r.FolderName]=temp;
                                                                    }
                                                                }
                                                            });
                                    
                                                            fol.forEach(f=>{
                                                                if(rep[f.Name]!=null)
                                                                {
                                                                    folRep[f.DeveloperName]=rep[f.Name];
                                                                }
                                                            })
                                                            if(rep['unfiled$public']!=null&&rep['unfiled$public']!=undefined){
                                                                folRep['unfiled$public']=rep['unfiled$public'];
                                                            }
                                                            createFolder(data, fileName, 'Reports',undefined, 'reports',folRep,undefined,members);
                                                        })
                                                    })
                                                }
                                                else{
                                                    //EntireDeployment
                                                    entireDeployxml(data,fileName);   
                                                }
                                        }
                                    }
                                })
                            })  
                        })
                    });
                })
        })

    }
    
    async function createFile(data,FileName,config, configValues, cName,folderMap,dash,relatedObj,quickActions,compactLayout)
    {
        createPackageXmlFile( data, FileName, configValues, config ,folderMap,relatedObj,quickActions,compactLayout);
        (async () =>{
            const r = await backupData(data.userName, data.password, data.sToken, data.sandboxId, FileName );
            
            console.log('Retrive Result : ',r);
            if( r=='Success' ){
                status='Retrieved Configurations';
                //Create file inside zip
                await changeXml( data, FileName, config, cName ,folderMap);
                setTimeout( ()=>{
                    (async () =>{
                        status = 'Deploying Configurations';
                        const r = await deployData( data.CustProductionUserName, data.custPRoductionPassword, data.custProductionSecurtiy, data.sandboxId, FileName );
                        console.log('Deploy Result 4: ',r);
                        if( r == 'Deploy' ){
                            if(data.Profiles != undefined  )
                            {
                                console.log('Deploying Profile');
                                var pNames = data.Profiles;
                                console.log('GNAM:',pNames);
                                pNames = pNames.replaceAll( '[', '' );
                                pNames = pNames.replaceAll( ']', '' );
                                var pNamesArr = pNames.split(',');
                                console.log('Names oF PRoFile !!!!!',pNamesArr);
                                createProfile(data, FileName, 'Profile', pNamesArr, 'profiles');
                            }else if(data.Deploy=='FinalEntire'){
                                    if(dash!=undefined){
                                        createFolder(data,FileName,'Dashboard',undefined,'dashboards',dash);
                                    }
                                    else if(globalMembers.length!=0){
                                        entireDeployxml(data,FileName);
                                    }
                                    else{
                                        console.log('Deploy Complete');
                                        status = 'Completed';
                                    }
                            }else if(data.Deploy=='FinalCustomSettings'){

                                console.log('Deploying Custom Settings Record');

                                deployCustomSettingsRecord(configValues,data)
                                
                            }else{
                                status='Completed';
                            }
                        }else{
                            status = r+' error';
                        }
                    })();
                }, 10000 );
            }else{
                status = r+' error';
            }
        })();   
    }

    async function deployCustomSettingsRecord(configValues,data){

        

        let config=configValues.splice(globalDeleteInd,1);

        config=config[0].replaceAll(' ','');

        var conn = new jsforce.Connection({
            loginUrl : 'https://test.salesforce.com'
        });

        conn.login(data.userName, data.password+data.sToken, function(err, userInfo) {
            if (err) { 
                status = 'error Wrong Password or Security Token in Sandbox';
                return console.error(err); 
            }

            conn.sobject(config).describe(function(err, meta) {
                if (err) { return console.error(err); }
                fieldNames='';
                // fieldAr=[];
    
    
                meta.fields.forEach(ele=>{
                    if(ele.createable && ele.name!='SetupOwnerId'){
                        fieldNames+=ele.name+',';
                    }
                })
    
                fieldNames=fieldNames.substring(0,fieldNames.length-1);
    

                conn.query('Select Id,'+fieldNames+' from '+config,function(err, result) {
                    if (err) { return console.error(err); }
                    console.log("Total Custom Settings Records : " + result.totalSize);
                    console.log("Fetched Custom Settings Records : " + result.records.length);
    
                    if(result.totalSize!=0){
    
                        toCreateRecord=[];
    
                        result.records.forEach(rec=>{

                            let temp={};

                            fieldNames.split(',').forEach(ele=>{
                                if(rec[ele]!=undefined){
                                    temp[ele]=rec[ele];
                                }
                            })

                            toCreateRecord.push(temp);
                        })
                        
                        var conn2 = new jsforce.Connection({
                            loginUrl : productionLogin
                        });
    
    
                        conn2.login(data.CustProductionUserName, data.custPRoductionPassword+data.custProductionSecurtiy, function(err, userInfo) {
                            if (err) { 
                                status = 'error Wrong Password or Security Token in Production';
                                return console.error(err); 
                            }
                            try{
                                conn2.query('Select Id,'+fieldNames+' from '+config,function(err, result) {
                                    let updateRec=[];
                                    let insRec=[];
                                    toCreateRecord.forEach(newRec=>{
                                        let flag=true;
                                        result.records.forEach(oldRec=>{
                                            if(newRec.Name==oldRec.Name){
                                                flag=true;
                                                updateRec.push(newRec);
                                            }
                                        });
                                        if(flag){
                                            insRec.push(newRec);
                                        }
                                    })

                                    if(updateRec.length!=0){        
                                        try {
                                            console.log('Updating');
                                            status='Updating Record';
                                            updateRec.forEach(ele=>{
                                                result.records.forEach(rec=>{
                                                    if(JSON.stringify(rec.Name).localeCompare(JSON.stringify(ele.Name))==0){
                                                        ele['Id']=rec.Id;
                                                    }
                                                })
                                            })
                                            conn2.sobject(config).update(updateRec, function(err, ret) {
                                                if(err){
                                                    status='Error :'+err;
                                                }else{
                                                    console.log('Updated Successfully : ' + ret);
                                                    
                                                    if(configValues.length!=0){
                                                        console.log('len : ',configValues.length);
                                                        deployCustomSettingsRecord(configValues,data);
                                                    }else{
                                                        status='Completed';
                                                    }
        
                                                }
                                            });
                                        } catch (error) {
                                            console.log(error);
                                        }
                                    }
                                    if(insRec.length!=0){
                                        try {
        
                                            console.log('creating');
        
                                            status='Creating Record';
        
                                            conn2.sobject(config).create(insRec, function(err, ret) {
                                                if(err){
                                                    status='Error :'+err;

                                                }else{
                                                    console.log("Created record id : " + ret.id);
                                                    
                                                    if(configValues.length!=0){
                                                        console.log('len : ',configValues.length);
                                                        deployCustomSettingsRecord(configValues,data);
                                                    }else{
                                                        status='Completed';
                                                    }
                                                }
                                            });
        
                                        } catch (error) {
                                            console.log(error);
                                        }
                                    }
                                })
                            }
                            catch(error){
                                console.log(error);
                            }
                        })
                    }else{
                        
                        if(configValues.length!=0){
                            console.log('len : ',configValues.length);
                            deployCustomSettingsRecord(configValues,data);
                        }else{
                            status='Completed';
                        }
                    }
                });
            });
        })


    }

    async function createProfile(data,FileName,config, configValues, cName,folderMap)
    {
        createPackageXmlFile( data, FileName, configValues, config ,folderMap);
        (async () =>{
            const r = await backupData(data.userName, data.password, data.sToken, data.sandboxId, FileName );
            
            console.log('Profile Retrivie Result : ',r);
            if( r=='Success' ){
                status='Retrieved Configurations';
                //Create file inside zip
                await changeXml( data, FileName, config, cName ,folderMap);
                setTimeout( ()=>{
                    (async () =>{
                        status = 'Deploying Configurations';
                        const r = await deployData( data.CustProductionUserName, data.custPRoductionPassword, data.custProductionSecurtiy, data.sandboxId, FileName );
                        console.log('Profile Deploy Result : ',r);
                        if( r == 'Deploy' ){
                            status = 'Completed';
                        }else{
                            status = r+' error';
                        }
                    })();
                }, 10000 );
            }else{
                status = r+' error';
            }
        })();
    }

    function prodSandboxJSONMap( cName, FileName, config, objUsed ){
        var jsonArr = [];
        var sandBoxJsonArr = [];
        //Reading files in prod zip file
        //cName:objects 
        if(fs.existsSync('./unpackaged')){
            if (fs.existsSync('./unpackaged/'+cName)){
                fs.readdir('./unpackaged/'+cName, function (err, files) {
                    //handling error
                    if (err) {
                        console.log('No directory');
                        checkCompareDir(cName, FileName, config, jsonArr, objUsed);
                    }else{
                        //listing all files using forEach
                        var checkLast = 0;
                        files.forEach(function (file) {
                            //unpackaged>layouts>account.layout
                            var fFile = './unpackaged/'+cName+'/'+file;
    
                            fs.readFile(fFile, 'utf8', (err, data) => {
                                if (err) {
                                    console.log(err);
                                }
                                checkLast++;
                                //Converting in JSON the 1st file in zip file(Account.layout)
                                xml.parseString(data, function (err, results) {
                                    var prodJson = JSON.stringify(results);
                                    var obj = {};
                                    obj[file] = prodJson;
                                    jsonArr.push( obj );
                                    if( checkLast == files.length ){
                                        if( config == 'Settings' ){
                                            if (fs.existsSync('./unpackaged/objects/'+objUsed+'.object')){
                                                fs.readFile('./unpackaged/objects/'+objUsed+'.object', 'utf8', (err, data) => {
                                                    if (err) {
                                                        console.log(err);
                                                    }
                                                    //Converting in JSON the 1st file in zip file(Account.layout)
                                                    xml.parseString(data, function (err, results) {
                                                        var owdJson = JSON.stringify(results);
                                                        owdJson = JSON.parse(owdJson);
                                                        var extModel = owdJson.CustomObject.externalSharingModel[0];
                                                        var sharModel = owdJson.CustomObject.sharingModel[0];
                                                        checkCompareDir(cName, FileName, config, jsonArr, objUsed, {shareSet:sharModel, extSet:extModel});
    
                                                    });
                                                });
                                            }else{
                                                console.log('File Does Not Exist '+'./unpackaged/objects/'+objUsed+'.object');
                                                checkCompareDir(cName, FileName, config, jsonArr, objUsed);
                                            }
                                        }else{
                                            checkCompareDir(cName, FileName, config, jsonArr, objUsed);
                                        }
                                    }
                                });
                            });
    
                        })
                    }
                });
            }else{
                
                console.log('no directory as ./unpackaged/'+cName);
                if( config == 'Settings' ){
                    if (fs.existsSync('./unpackaged/objects/'+objUsed+'.object')){
                        fs.readFile('./unpackaged/objects/'+objUsed+'.object', 'utf8', (err, data) => {
                            if (err) {
                                console.log(err);
                            }
                            //Converting in JSON the 1st file in zip file(Account.layout)
                            xml.parseString(data, function (err, results) {
                                var owdJson = JSON.stringify(results);
                                owdJson = JSON.parse(owdJson);
                                var extModel = owdJson.CustomObject.externalSharingModel[0];
                                var sharModel = owdJson.CustomObject.sharingModel[0];
                                checkCompareDir(cName, FileName, config, jsonArr, objUsed, {shareSet:sharModel, extSet:extModel});
    
                            });
                        });
                    }else{
                        console.log('File Does Not Exist '+'./unpackaged/objects/'+objUsed+'.object');
                        checkCompareDir(cName, FileName, config, jsonArr, objUsed);
                    }
                }else{
                    checkCompareDir(cName, FileName, config, jsonArr, objUsed);
                }
            }  
            return jsonArr;
        }else{
            console.log('Unpackaged does not exist');
        }
    }

    // Used to compare prod and sandbox json
    function checkCompareDir(cName, FileName, config, jsonArr, objUsed, sSet){


        var sandBoxJsonArr = [];
        if (fs.existsSync('./unpackaged')) {
            fs.rmdirSync('./unpackaged', { recursive: true });
        }
        //Unziping sandbox zip file
        if (fs.existsSync(FileName+'.zip')) {
            fs.createReadStream(FileName+'.zip')
            .pipe(
                unzipper.Extract({ path: './' })
            );
        }
        setTimeout( ()=>{
            if(fs.existsSync('./unpackaged')){
                if (fs.existsSync('./unpackaged/'+cName)){
                    fs.readdir('./unpackaged/'+cName, function (err, files) {
                        if (err) {
                            console.log('Unable to scan directory: ' + err);
                            compareFile( JSON.parse(JSON.stringify(sandBoxJsonArr)), JSON.parse(JSON.stringify(jsonArr)), config ,undefined,undefined,FileName);
                        } else{
                            //listing all files using forEach
                            var checkLast = 0;
                            files.forEach(function (file) {
                                var fFile = './unpackaged/'+cName+'/'+file;
    
                                if (fs.existsSync(fFile)) {
    
                                    fs.readFile(fFile, 'utf8', (err, data) => {
                                        if (err) {
                                            console.log(err);
                                        }
                                        checkLast++;
                                        xml.parseString(data, function (err, results) {
                                            var sandJson = JSON.stringify(results);
                                            var obj = {};
                                            obj[file] = sandJson;
                                            sandBoxJsonArr.push( obj );
                                            if( checkLast == files.length ){
                                                if( config == 'Settings' ){
                                                    if (fs.existsSync('./unpackaged/objects/'+objUsed+'.object')){
                                                        fs.readFile('./unpackaged/objects/'+objUsed+'.object', 'utf8', (err, data) => {
                                                            if (err) {
                                                                console.log(err);
                                                            }
                                                            //Converting in JSON the 1st file in zip file(Account.layout)
                                                            xml.parseString(data, function (err, results) {
                                                                var owdJson = JSON.stringify(results);
                                                                owdJson = JSON.parse(owdJson);
                                                                var extModel = owdJson.CustomObject.externalSharingModel[0];
                                                                var sharModel = owdJson.CustomObject.sharingModel[0];
                                                                fs.rmdirSync('./unpackaged', { recursive: true });
                                                                compareFile( JSON.parse(JSON.stringify(sandBoxJsonArr)), JSON.parse(JSON.stringify(jsonArr)), config, {shareSet:sharModel, extSet:extModel}, sSet ,FileName);
                                                            });
                                                        });
                                                    }else{
                                                        fs.rmdirSync('./unpackaged', { recursive: true });
                                                        compareFile( JSON.parse(JSON.stringify(sandBoxJsonArr)), JSON.parse(JSON.stringify(jsonArr)), config ,undefined,undefined,FileName);
                                                    }
                                                }else{
                                                    fs.rmdirSync('./unpackaged', { recursive: true });
                                                    compareFile( JSON.parse(JSON.stringify(sandBoxJsonArr)), JSON.parse(JSON.stringify(jsonArr)), config ,undefined,undefined,FileName);
                                                }
                                            }
                                        });
                                    });
                                }
                            });
                        }
                    });
                }else{
                    console.log('Comparing Files');
    
                    if( config == 'Settings' ){
                        if (fs.existsSync('./unpackaged/objects/'+objUsed+'.object')){
                            fs.readFile('./unpackaged/objects/'+objUsed+'.object', 'utf8', (err, data) => {
                                if (err) {
                                    console.log(err);
                                }
                                //Converting in JSON the 1st file in zip file(Account.layout)
                                xml.parseString(data, function (err, results) {
                                    var owdJson = JSON.stringify(results);
                                    owdJson = JSON.parse(owdJson);
                                    var extModel = owdJson.CustomObject.externalSharingModel[0];
                                    var sharModel = owdJson.CustomObject.sharingModel[0];
                                    fs.rmdirSync('./unpackaged', { recursive: true });
                                    compareFile( JSON.parse(JSON.stringify(sandBoxJsonArr)), JSON.parse(JSON.stringify(jsonArr)), config, {shareSet:sharModel, extSet:extModel}, sSet ,FileName);
                                });
                            });
                        }else{
                            fs.rmdirSync('./unpackaged', { recursive: true });
                            compareFile( JSON.parse(JSON.stringify(sandBoxJsonArr)), JSON.parse(JSON.stringify(jsonArr)), config ,undefined,undefined,FileName);
                        }
                    }else{
                        fs.rmdirSync('./unpackaged', { recursive: true });
                        compareFile( JSON.parse(JSON.stringify(sandBoxJsonArr)), JSON.parse(JSON.stringify(jsonArr)), config ,undefined,undefined,FileName);
                    }
                }
            }
        }, 20000 );
    }
    function compareFile( sandBoxJsonArr, prodJsonArr, config, sSet, pSet,fileName ){
        try{
            if( sandBoxJsonArr != undefined && prodJsonArr != undefined ){
                status = 'Comparing';
                var changed = [];
                if( config == 'Settings' ){
                    if( sSet.shareSet != pSet.shareSet ){
                        changed.push( {label:'Internal Access', value:'Changed to '+sSet.shareSet} );
                    }
                    if( sSet.extSet != pSet.extSet ){
                        changed.push( {label:'External Access', value:'Changed to '+sSet.extSet} );
                    }
                }
                var ele = 0;
                var prodEle;
                for( ; ele< sandBoxJsonArr.length; ele++ ){
                    var sandboxEle = sandBoxJsonArr[ele];
                    prodEle = undefined;
                    //File details
                    var sandboxKey = Object.keys( sandboxEle );
                    for( var i = 0; i< prodJsonArr.length; i++ ){
                        var pKey = Object.keys( prodJsonArr[i] );
                        if( pKey[0] == sandboxKey[0] ){
                            prodEle = prodJsonArr[i];
                            break;
                        }
                    }
                    if( prodEle == undefined ){
                        changed.push( {label:sandboxKey[0], value:'New '+config} );
                    }else{
                        var prodJson = JSON.parse(JSON.stringify(prodEle[sandboxKey[0]]));
                        var sandBoxJson = JSON.parse(JSON.stringify(sandboxEle[sandboxKey[0]]));
                        prodJson = JSON.parse(prodJson);
                        sandBoxJson = JSON.parse( sandBoxJson );
                        var pFields;
                        var sFields;
                        var sandboxMap = {};
                        var prodMap = {};
                        if( config == 'CustomField' ){
                            if( prodJson.CustomObject != undefined && sandBoxJson.CustomObject != undefined ){
                                pFields = prodJson.CustomObject.fields;
                                sFields = sandBoxJson.CustomObject.fields;
                                for( var val of sFields ){
                                    var nam = val.fullName+' ( '+sandboxKey[0]+' )';
                                    sandboxMap[nam] = val;
                                }
                                for( var val of pFields ){
                                    var nam = val.fullName+' ( '+sandboxKey[0]+' )';
                                    prodMap[nam] = val;
                                }
                            }
                        }else if( config == 'ListView' ){
                            pFields = prodJson.CustomObject.listViews;
                            sFields = sandBoxJson.CustomObject.listViews;
                            if( pFields != undefined && sFields!=undefined ){
                                for( var val of sFields ){
                                    sandboxMap[val.fullName] = val;
                                }
                                for( var val of pFields ){
                                    prodMap[val.fullName] = val;
                                }
                            }
                        } else if( config == 'Layout' ){
                            pFields = prodJson.Layout.layoutSections;
                            sFields = sandBoxJson.Layout.layoutSections;
                            for( var val of pFields ){
                                if(val.label!=undefined){
                                    if(val.label.length!=0){
                                        prodMap[val.label[0]] = val.layoutColumns;
                                    }
                                }
                            }
                            for( var val of sFields ){
                                if(val.label!=undefined){
                                    if(val.label.length!=0){
                                        sandboxMap[val.label[0]] = val.layoutColumns;
                                    }
                                }
                            }
                        }else if( config == 'Settings' ){
                            if( prodJson.SharingRules != undefined && sandBoxJson.SharingRules!= undefined ){
                                if( prodJson.SharingRules.sharingCriteriaRules!= undefined && sandBoxJson.SharingRules.sharingCriteriaRules != undefined ){
                                    pFields = prodJson.SharingRules.sharingCriteriaRules;
                                    sFields = sandBoxJson.SharingRules.sharingCriteriaRules;
                                    for( var val of pFields ){
                                        prodMap[val.fullName[0]] = val;
                                    }
                                    for( var val of sFields ){
                                        sandboxMap[val.fullName[0]] = val;
                                    }
                                }else{
                                    if( sandBoxJson.SharingRules.sharingCriteriaRules != undefined ){
                                        var sCriteriaRules = sandBoxJson.SharingRules.sharingCriteriaRules;
                                        for( var v in sCriteriaRules ){
                                            changed.push( {label:v.fullName[0], value:'New Sharing Criteria Rule'} );
                                        }
                                    }
                                }
                                if( prodJson.SharingRules.sharingOwnerRules!= undefined && sandBoxJson.SharingRules.sharingOwnerRules != undefined ){
                                    pFields = prodJson.SharingRules.sharingOwnerRules;
                                    sFields = sandBoxJson.SharingRules.sharingOwnerRules;
                                    for( var val of pFields ){
                                        prodMap[val.fullName[0]] = val;
                                    }
                                    for( var val of sFields ){
                                        sandboxMap[val.fullName[0]] = val;
                                    }
                                }else{
                                    if( sandBoxJson.SharingRules.sharingOwnerRules != undefined ){
                                        var sCriteriaRules = sandBoxJson.SharingRules.sharingOwnerRules;
                                        for( var v in sCriteriaRules ){
                                            changed.push( {label:v.fullName[0], value:'New Sharing Owner Rule'} );
                                        }
                                    }
                                }
                            }else{
                                if( sandBoxJson.SharingRules != undefined ){
                                    changed.push( {label:'Sharing Rules', value:'New Sharing Rules added'} );
                                }
                            }
                        }else if(config == 'FlexiPage'){

                            if(prodJson!=undefined&&sandBoxJson!=undefined){

                                if(JSON.stringify(prodJson.FlexiPage.flexiPageRegions).localeCompare(JSON.stringify(sandBoxJson.FlexiPage.flexiPageRegions))!=0){
    
                                    changed.push( {label:sandboxKey[0], value:'Change In Component'} );
                                    
                                }if(JSON.stringify(prodJson.FlexiPage.template).localeCompare(JSON.stringify(sandBoxJson.FlexiPage.template))!=0){
                                    
                                    changed.push( {label:sandboxKey[0], value:'Change In Template'} );
                                    
                                }if(JSON.stringify(prodJson.FlexiPage.type).localeCompare(JSON.stringify(sandBoxJson.FlexiPage.type))!=0){
                                    
                                    
                                }if(JSON.stringify(prodJson.FlexiPage.masterLabel).localeCompare(JSON.stringify(sandBoxJson.FlexiPage.masterLabel))!=0){
                                    
                                    changed.push( {label:sandboxKey[0], value:'Change In Masterlabel'} );

                                }

                            }
                            
                        }
                        if( config == 'CustomField' ){
                            fillCompareMap( sandboxMap, prodMap, changed, config );
                        }else if( config == 'ListView' ){
                            fillCompareMap( sandboxMap, prodMap, changed, config );
                        }else if( config == 'Layout' ){
                            fillCompareMap( sandboxMap, prodMap, changed, config, sandboxKey[0] );
                        }else if( config == 'Settings' ){
                            fillCompareMap( sandboxMap, prodMap, changed, config, sandboxKey[0] );
                        }else if( config == 'QuickAction' ){
                            if(prodJson.QuickAction!=undefined&&sandBoxJson.QuickAction!=undefined){
                                let keys=Object.keys(sandBoxJson.QuickAction);
                                keys.forEach(k=>{
                                    if(prodJson.QuickAction[k]!=undefined&&prodJson.QuickAction[k]!=null){
                                        if(JSON.stringify(prodJson.QuickAction[k]).localeCompare(JSON.stringify(sandBoxJson.QuickAction[k]))!=0){
                                            changed.push( {label:sandboxKey[0], value:'Change In '+k} );
                                        }
                                    }
                                    else{
                                        changed.push( {label:sandboxKey[0], value:'Change In '+k} );
                                    }
                                })
                            }

                        }else if( config == 'CompactLayout' ){
                            if(prodJson!=undefined&&sandBoxJson!=undefined){

                                let prodAr=prodJson.CustomObject.compactLayouts;
                                let sandAr=sandBoxJson.CustomObject.compactLayouts;

                                let sandFullName=[];
                                let prodFullName=[];


                                sandAr.forEach(sand=>{

                                    if(!sandFullName.includes(sand.fullName)){
                                        sandFullName.push(sand.fullName[0]);
                                    }

                                    prodAr.forEach(prod=>{

                                        if(!prodFullName.includes(prod.fullName)){
                                            prodFullName.push(prod.fullName[0]);
                                        }
                                        if(JSON.stringify(prod.fields).localeCompare(JSON.stringify(sand.fields))!=0 && JSON.stringify(prod.fullName).localeCompare(JSON.stringify(sand.fullName))==0){
                                            changed.push( {label:sandboxKey[0], value:'Change In Compact Layout ( '+sand.fullName+' )'} );
                                        }if(JSON.stringify(prod.label).localeCompare(JSON.stringify(sand.label))!=0 && JSON.stringify(prod.fullName).localeCompare(JSON.stringify(sand.fullName))==0){
                                            changed.push( {label:sandboxKey[0], value:'Change In Compact Label ( '+sand.fullName+' )'} );
                                        }
                                    })

                                })
                                sandFullName.forEach(ele=>{
                                    if(!prodFullName.includes(ele)){
                                        changed.push( {label:sandboxKey[0], value:'New In Compact Layout ( '+ele+' )'} );
                                    }
                                })
                            }
                        }
                    }
                }
                if(finalChanges.Compare!=undefined&&finalChanges.Compare!=null){
                    changed.forEach(ele=>{
                        finalChanges.Compare.push(ele);
                    })
                }else{
                    finalChanges['Compare']=changed;
                }
                if(config=='Layout'){
                    try {
                        if(globalQuickActions.length!=0){
                            if(fs.existsSync(fileName+'prod.zip')){
                                fs.createReadStream(fileName+'prod.zip')
                                .pipe(
                                    unzipper.Extract({ path: './' })
                                );
            
            
                                let timeout=40000;
                                if(config=='Settings'){
                                    timeout=60000;
                                }
                                setTimeout( ()=>{
                                    prodSandboxJSONMap( 'quickActions', fileName,'QuickAction', '');
                                },timeout);
                            }else{
                                console.log('No such file');
                            }
                        }else if(globalCompactLayout.length!=0){
                            if(fs.existsSync(fileName+'prod.zip')){
                                fs.createReadStream(fileName+'prod.zip')
                                .pipe(
                                    unzipper.Extract({ path: './' })
                                );
            
            
                                let timeout=40000;
                                if(config=='Settings'){
                                    timeout=60000;
                                }
                                setTimeout( ()=>{
                                    prodSandboxJSONMap( 'objects', fileName, 'CompactLayout', '');
                                },timeout);
                            }
                        }else{
                            status = finalChanges;
                            try
                            {
                                if (fs.existsSync(fileName+'.xml')) {
                                    fs.unlink(fileName+'.xml', function (err) {
                                        if (err) throw err;
                                    });
                                }
                                if (fs.existsSync(fileName+'prod.zip')) {
                                    fs.unlink(fileName+'prod.zip', function (err) {
                                        if (err) throw err;
                                    });
                                }
                                if (fs.existsSync(fileName+'.zip')) {
                                    fs.unlink(fileName+'.zip', function (err) {
                                        if (err) throw err;
                                    });
                                }
                            }
                            catch(e)
                            {
                                console.log(e);
                            }
                            
                        }
                    } catch (error) {
                        console.log(error);
                    }
                }else if(config=='QuickAction'){
                    if(globalCompactLayout.length!=0){
                        if(fs.existsSync(fileName+'prod.zip')){
                            fs.createReadStream(fileName+'prod.zip')
                            .pipe(
                                unzipper.Extract({ path: './' })
                            );
        
        
                            let timeout=40000;
                            if(config=='Settings'){
                                timeout=60000;
                            }
                            setTimeout( ()=>{
                                prodSandboxJSONMap( 'objects', fileName, 'CompactLayout', '');
                            },timeout);
                        }
                    }else{

                        status = finalChanges;
                        try
                        {
        
                            if (fs.existsSync(fileName+'.xml')) {
                                fs.unlink(fileName+'.xml', function (err) {
                                    if (err) throw err;
                                });
                            }
                            if (fs.existsSync(fileName+'prod.zip')) {
                                fs.unlink(fileName+'prod.zip', function (err) {
                                    if (err) throw err;
                                });
                            }
                            if (fs.existsSync(fileName+'.zip')) {
                                fs.unlink(fileName+'.zip', function (err) {
                                    if (err) throw err;
                                });
                            }
                        }
                        catch(e)
                        {
                            console.log(e);
                        }

                    }
                }else{
                    status = finalChanges;
                    //deleteCompare
                    try
                    {
    
                        if (fs.existsSync(fileName+'.xml')) {
                            fs.unlink(fileName+'.xml', function (err) {
                                if (err) throw err;
                            });
                        }
                        if (fs.existsSync(fileName+'prod.zip')) {
                            fs.unlink(fileName+'prod.zip', function (err) {
                                if (err) throw err;
                            });
                        }
                        if (fs.existsSync(fileName+'.zip')) {
                            fs.unlink(fileName+'.zip', function (err) {
                                if (err) throw err;
                            });
                        }
                    }
                    catch(e)
                    {
                        console.log(e);
                    }
                }
            }else{
                //deleteCompare
                try
                {

                    if (fs.existsSync(fileName+'.xml')) {
                        fs.unlink(fileName+'.xml', function (err) {
                            if (err) throw err;
                        });
                    }
                    if (fs.existsSync(fileName+'prod.zip')) {
                        fs.unlink(fileName+'prod.zip', function (err) {
                            if (err) throw err;
                        });
                    }
                    if (fs.existsSync(fileName+'.zip')) {
                        fs.unlink(fileName+'.zip', function (err) {
                            if (err) throw err;
                        });
                    }
                }
                catch(e)
                {
                    console.log(e);
                }
                
                status = 'Error-Nothig to compare';
                console.log('Error-Nothig to compare');
                
            }
        }catch( err ){
            //deleteCompare
            try
                {

                    if (fs.existsSync(fileName+'.xml')) {
                        fs.unlink(fileName+'.xml', function (err) {
                            if (err) throw err;
                        });
                    }
                    if (fs.existsSync(fileName+'prod.zip')) {
                        fs.unlink(fileName+'prod.zip', function (err) {
                            if (err) throw err;
                        });
                    }
                    if (fs.existsSync(fileName+'.zip')) {
                        fs.unlink(fileName+'.zip', function (err) {
                            if (err) throw err;
                        });
                    }
                }
                catch(e)
                {
                    console.log(e);
                }
            
            
            console.log(err);
            status = 'error-'+err;
        }
    }
    function fillCompareMap(sandboxMap, prodMap, changed, config, sKey){
        if( sandboxMap != undefined ){
            for( var val in sandboxMap ){
                //sField=AllAccount:{fName:aa, col:[]}
                var sField = sandboxMap[val];
                var pField = prodMap[val];
                if( pField == undefined ){
                    if( config=='Layout' ){
                        changed.push( {label:sKey, value:'New "'+val+'" Section'} );    
                    }else{
                        if( config == 'CustomField' ){
                            changed.push( {label:sField.fullName[0], value:'New '+config + ' in '+val.substring(val.indexOf('('))} );
                        }else
                            changed.push( {label:sField.fullName[0], value:'New '+config} );
                    }
                }else if( sField != undefined){
                    if( config == 'Layout' ){
                        sField = sandboxMap[val][0];
                        pField = prodMap[val][0];
                    }
                    if( val == 'Custom Links' ){
                        continue;
                    }
                    var m = val;
                    for( var k in sField ){
                        if( k == 'valueSet' ){
                            continue;
                        }
                        if( pField[k] != undefined && sField[k] != undefined ){
                            for( var val = 0; val < sField[k].length && val < pField[k].length; val++ ){
                                var sF = sField[k];
                                var pF = pField[k];
                                if(config == 'Layout'){
                                    if( sField[k][val].behavior[0] != pField[k][val].behavior[0] || sField[k][val].field[0] != pField[k][val].field[0] ){

                                        changed.push({label:sKey, value:'Change in section "'+m+'"'});
                                        break;
                                    }
                                }else if( k == 'accountSettings' ){
                                    for( var i in sF[val] ){
                                        if( sF[val][i][0] != pF[val][i][0] ){
                                            changed.push({label:sKey, value:'Change in "'+i+'"'});
                                        }
                                    }
                                } 
                                else if( k == 'criteriaItems' )     continue; 
                                else if( k == 'sharedTo' || k == 'sharedFrom' ){
                                    for( var i in sF[val] ){
                                        
                                        if( sF[val][i][0] != pF[val][i][0] ){
                                            changed.push({label:sKey, value:'Change in "'+k+'"'});
                                            break;
                                        }
                                    }
                                }
                                else if ( JSON.stringify(sF[val]).localeCompare(JSON.stringify(pF[val])) != 0 ){
                                    if( config == 'CustomField' ){
                                        changed.push( {label:sField.fullName[0], value:'Change in '+k+ ' in '+m.substring(m.indexOf('('))} );
                                    }else
                                        changed.push({label:sField.fullName[0], value:'Change in '+k});
                                    break;
                                }
                            }
                            if(pField[k].length<sField[k].length){

                                if(k=='columns'){
                                    changed.push({label:sField.label[0], value:'Change in '+k});
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    app.get( "/getStatus", ( req, res )=>{
        res.send( status );
        console.log(status);
        if( status == 'Completed' ){
            status = '';
        }
    } );
    app.post( "/deployData", ( req, res )=>{

        console.log('STARTING DEPLOYDATA');

        if(fs.existsSync('./unpackaged')){
            fs.rmdir('./unpackaged', { recursive: true }, err => {
                if (err) {
                  throw err
                }
              })
        }

        globalDeleteInd=0;
        status='Starting';
        res.send('Starting');
        const data = req.body;
        console.log('Deploy Starting');
        var conn = new jsforce.Connection({
            loginUrl : 'https://test.salesforce.com'
        });
        // 'cyntexa2@dev2.com', 'Cyntexa@123b6sl1HwJ692lCjCPachYx2eA'
        conn.login(data.userName, data.password+data.sToken, function(err, userInfo) {
            if (err) { 
                status = 'error Wrong Password or Security Token in Sandbox';
                return console.error(err); 
            }
            if(data.relatedObj!=undefined){
                var fullNames = [...data.relatedObj];
                fullNames.push(data.objUsed);
            }
            else{
                var fullNames=[data.objUsed];
            }

            conn.metadata.read('CustomObject', fullNames, function(err, metadata) {
                if( metadata != undefined ){
                    var FileName = data.objUsed+'_retrieve_'+data.Deploy+''+data.sandboxId;
                    FileName = FileName.replaceAll( ' ', '_' );
                    FileName = FileName.replaceAll( '/', '' );
                    if(data.Deploy == 'FinalEntire'){
                        deployEntire(data,FileName);
                    }else if(data.Deploy == 'Fields')
                    {
                        console.log('Deploying Fields');
                        if(metadata.fields!=undefined){
                            if( metadata.fields.length !=undefined ){
                                createFile(data, FileName, 'CustomField', metadata.fields , 'objects');
                            }
                            else{
                                let ar=[metadata.fields];
                                createFile(data, FileName, 'CustomField',ar , 'objects');
                            }
                        }else if(metadata.length!=undefined){

                            var sendingAr=[];
                            var relatedObj=[];

                            metadata.forEach(ele=>{
                                if(ele.fields!=undefined && ele.fullName==data.objUsed){
                                    if(ele.fields.length!=undefined){
                                        sendingAr=ele.fields;
                                    }else{
                                        sendingAr.push(ele.fields);
                                    }
                                }else if(ele.fields!=undefined){
                                    relatedObj.push(ele);
                                }
                            })

                            if(sendingAr.length!=0){
                                createFile(data, FileName, 'CustomField', sendingAr, 'objects',undefined,undefined,relatedObj);
                            }else{
                                status = 'Error-No fields';
                            }
                        }else{
                            status='Error : No Fields';
                        }
                    }else if( data.Deploy == 'Entire' ){
                        fetchGlobalItems( data );
                    }else if(data.Deploy == 'Layout')
                    {
                        console.log('Deploying Layout');
                        conn.query("SELECT id,DurableId, QualifiedApiName FROM EntityDefinition WHERE QualifiedApiName='"+data.objUsed+"'",function(err,objName1){
                            let obj=objName1.records[0].DurableId;
                            conn.tooling.sobject('Layout')
                            .find({ TableEnumOrId: obj }, "Name,NamespacePrefix")
                            .execute(function(err, records) {

                                records.forEach(ele=>{
                                    if(ele.NamespacePrefix!=null){
                                        ele.Name=ele.NamespacePrefix+'__'+ele.Name;
                                    }
                                })

                                let quickActions='';

                                //For main Object
                                conn.tooling.sobject('QuickActionDefinition')
                                .find({SobjectType : data.objUsed}).select('DeveloperName,NamespacePrefix')
                                .execute(function(err, res) {
                                    
                                    res.forEach(ele=>{

                                        if(ele.NamespacePrefix!=null&&ele.NamespacePrefix!=undefined){
                                            quickActions+='<members>'+data.objUsed+'.'+ele.NamespacePrefix+'__'+ele.DeveloperName+'</members>';
                                        }else{
                                            quickActions+='<members>'+data.objUsed+'.'+ele.DeveloperName+'</members>';
                                        }

                                    })
                                    
                                    compactLayout='';

                                    //For main Object
                                    conn.tooling.sobject('CompactLayout')
                                    .find({SobjectType :data.objUsed}).select('DeveloperName,NamespacePrefix')
                                    .execute(function(err, res) {

                                        res.forEach(ele=>{
                                            if(ele.NamespacePrefix!=null&&ele.NamespacePrefix!=undefined){
                                                compactLayout+='<members>'+data.objUsed+'.'+ele.NamespacePrefix+'__'+ele.DeveloperName+'</members>';
                                            }else{
                                                compactLayout+='<members>'+data.objUsed+'.'+ele.DeveloperName+'</members>';
                                            }
                                        })


                                        if(data.relatedObj.length!=0){
        
                                            let relatedObj=[];
        
                                            conn.query("SELECT id,DurableId, QualifiedApiName FROM EntityDefinition WHERE QualifiedApiName='"+data.relatedObj[0]+"'",function(err,objName2){
        
                                                if(objName2.records.length!=0){
        
                                                    let obj1=objName2.records[0].DurableId;
        
                                                    conn.tooling.sobject('Layout')
                                                    .find({ TableEnumOrId: obj1 }, "Name,NamespacePrefix")
                                                    .execute(function(err, records1) {
        
                                                        let json1={fullName:data.relatedObj[0]};
                                                        json1['layouts']=[];
        
                                                        records1.forEach(ele=>{
                                                            if(ele.NamespacePrefix!=null){
                                                                ele.Name=ele.NamespacePrefix+'__'+ele.Name;
                                                            }
                                                            json1.layouts.push({fullName:ele.Name});
                                                        })
        
                                                        relatedObj.push(json1);

                                                        //For Related 1
                                                        conn.tooling.sobject('QuickActionDefinition')
                                                        .find({SobjectType : data.relatedObj[0]}).select('DeveloperName,NamespacePrefix')
                                                        .execute(function(err, res) {
                                                            
                                                            res.forEach(ele=>{
                                                                
                                                                if(ele.NamespacePrefix!=null&&ele.NamespacePrefix!=undefined){
                                                                    quickActions+='<members>'+data.relatedObj[0]+'.'+ele.NamespacePrefix+'__'+ele.DeveloperName+'</members>';
                                                                }else{
                                                                    quickActions+='<members>'+data.relatedObj[0]+'.'+ele.DeveloperName+'</members>';
                                                                }
                                                                
                                                            })

                                                            //For Related 1
                                                            conn.tooling.sobject('CompactLayout')
                                                            .find({SobjectType :data.relatedObj[0]}).select('DeveloperName,NamespacePrefix')
                                                            .execute(function(err, res) {
                                                                
                                                                res.forEach(ele=>{
                                                                    if(ele.NamespacePrefix!=null&&ele.NamespacePrefix!=undefined){
                                                                        compactLayout+='<members>'+data.relatedObj[0]+'.'+ele.NamespacePrefix+'__'+ele.DeveloperName+'</members>';
                                                                    }else{
                                                                        compactLayout+='<members>'+data.relatedObj[0]+'.'+ele.DeveloperName+'</members>';
                                                                    }
                                                                })

                                                                if(data.relatedObj.length>1){
                
                                                                    conn.query("SELECT id,DurableId, QualifiedApiName FROM EntityDefinition WHERE QualifiedApiName='"+data.relatedObj[1]+"'",function(err,objName3){
                
                                                                        if(objName3.records.length!=0){
                            
                                                                            let obj2=objName3.records[0].DurableId;
                            
                                                                            conn.tooling.sobject('Layout')
                                                                            .find({ TableEnumOrId: obj2 }, "Name,NamespacePrefix")
                                                                            .execute(function(err, records2) {
                            
                                                                                let json2={fullName:data.relatedObj[1]};
                                                                                json2['layouts']=[];
                            
                                                                                records2.forEach(ele=>{
                                                                                    if(ele.NamespacePrefix!=null){
                                                                                        ele.Name=ele.NamespacePrefix+'__'+ele.Name;
                                                                                    }
                                                                                    json2.layouts.push({fullName:ele.Name});
                                                                                })

                                                                                //For Related 2
                                                                                conn.tooling.sobject('QuickActionDefinition')
                                                                                .find({SobjectType : data.relatedObj[1]}).select('DeveloperName,NamespacePrefix')
                                                                                .execute(function(err, res) {
                                                                                    
                                                                                    res.forEach(ele=>{

                                                                                        if(ele.NamespacePrefix!=null&&ele.NamespacePrefix!=undefined){
                                                                                            quickActions+='<members>'+data.relatedObj[1]+'.'+ele.NamespacePrefix+'__'+ele.DeveloperName+'</members>';
                                                                                        }else{
                                                                                            quickActions+='<members>'+data.relatedObj[1]+'.'+ele.DeveloperName+'</members>';
                                                                                        }

                                                                                    })

                                                                                    
                                                                                    //For Related 2
                                                                                    conn.tooling.sobject('CompactLayout')
                                                                                    .find({SobjectType :data.relatedObj[1]}).select('DeveloperName,NamespacePrefix')
                                                                                    .execute(function(err, res) {

                                                                                        res.forEach(ele=>{
                                                                                            if(ele.NamespacePrefix!=null&&ele.NamespacePrefix!=undefined){
                                                                                                compactLayout+='<members>'+data.relatedObj[1]+'.'+ele.NamespacePrefix+'__'+ele.DeveloperName+'</members>';
                                                                                            }else{
                                                                                                compactLayout+='<members>'+data.relatedObj[1]+'.'+ele.DeveloperName+'</members>';
                                                                                            }
                                                                                        })

                        
                                                                                        relatedObj.push(json2);
                                                                                        
                                                                                        createFile(data, FileName, 'Layout', records, 'layouts',undefined,undefined,relatedObj,quickActions,compactLayout);
                                                                                    })
                                                                                })
                                                                            })
                                                                        }else{
                                                                            status='Error : No Such Object as '+data.relatedObj[1];
                                                                        }
                                                                    })
                                                                }
                                                                else{
                                                                    createFile(data, FileName, 'Layout', records, 'layouts',undefined,undefined,relatedObj,quickActions,compactLayout);
                                                                }
                                                            })
                                                        })  
                                                    })
                                                }else{
                                                    status='Error : No Such Object as '+data.relatedObj[0];
                                                }
                                            })
                                        }
                                        else if(records!=undefined){
                                            createFile(data, FileName, 'Layout', records, 'layouts',undefined,undefined,undefined,quickActions,compactLayout);
                                        }
                                        else{
                                            status='Error No Records';
                                        }
                                    })
                                    
                                });
                            });
                        })
                    }else if(data.Deploy=='Lightning Page'){

                        console.log('Deploying Lightning Page');
                        conn.query("SELECT id,DurableId, QualifiedApiName FROM EntityDefinition WHERE QualifiedApiName='"+data.objUsed+"'",function(err,objName1){
                            let obj=objName1.records[0].DurableId;
                            conn.tooling.sobject('FlexiPage').find({ EntityDefinitionId : obj ,Type:"RecordPage"}).select('DeveloperName,MasterLabel,EntityDefinitionId,Type,NamespacePrefix').execute(function(err, records) {
                                if(err){
                                    console.log(err);
                                }
                                let ar=[];
                                if(records!=undefined){
                                    if(records.length!=undefined){

                                        records.forEach(ele=>{
                                            if(ele.NamespacePrefix!=null){
                                                ele.DeveloperName=ele.NamespacePrefix+'__'+ele.DeveloperName;
                                            }
                                        })

                                        records.forEach(ele=>{
                                            ar.push(ele.DeveloperName);
                                        })


                                        if(data.relatedObj.length!=0){

                                            conn.query("SELECT id,DurableId, QualifiedApiName FROM EntityDefinition WHERE QualifiedApiName='"+data.relatedObj[0]+"'",function(err,objName2){

                                                let obj1=objName2.records[0].DurableId;

                                                conn.tooling.sobject('FlexiPage').find({ EntityDefinitionId : obj1 ,Type:"RecordPage"}).select('DeveloperName,MasterLabel,EntityDefinitionId,Type,NamespacePrefix').execute(function(err, records1) {
                                                    if(records1.length!=undefined){

                                                        records1.forEach(ele=>{
                                                            if(ele.NamespacePrefix!=undefined){
                                                                ele.DeveloperName=ele.NamespacePrefix+'__'+ele.DeveloperName;
                                                            }
                                                        })
                                                        records1.forEach(ele=>{
                                                            ar.push(ele.DeveloperName);
                                                        })

                                                        if(data.relatedObj.length>1){

                                                            conn.query("SELECT id,DurableId, QualifiedApiName FROM EntityDefinition WHERE QualifiedApiName='"+data.relatedObj[1]+"'",function(err,objName2){
                
                                                                let obj2=objName2.records[0].DurableId;
                
                                                                conn.tooling.sobject('FlexiPage').find({ EntityDefinitionId : obj2 ,Type:"RecordPage"}).select('DeveloperName,MasterLabel,EntityDefinitionId,Type,NamespacePrefix').execute(function(err, records2) {
                                                                    if(records2.length!=undefined){
                
                                                                        records2.forEach(ele=>{
                                                                            if(ele.NamespacePrefix!=undefined){
                                                                                ele.DeveloperName=ele.NamespacePrefix+'__'+ele.DeveloperName;
                                                                            }
                                                                        })
                                                                        records2.forEach(ele=>{
                                                                            ar.push(ele.DeveloperName);
                                                                        })

                                                                        if(ar.length>0){
                                                                            createFile(data, FileName, 'FlexiPage', ar, 'flexipages');
                                                                        }else{
                                                                            status='Error : No Lightning Page';
                                                                        }

                                                                    }
                                                                })
                
                                                            })
                
                                                        }else if(ar.length>0){
                                                            createFile(data, FileName, 'FlexiPage', ar, 'flexipages');
                                                        }else{
                                                            status='Error : No Lightning Page';
                                                        }

                                                    }
                                                })

                                            })

                                        }else if(ar.length>0){
                                            createFile(data, FileName, 'FlexiPage', ar, 'flexipages');
                                        }
                                        else{
                                            status='Error : No Lightning Page';
                                        }
                                    }
                                    else{
                                        status='Error : No Lightning Page';
                                    }
                                }
                                else{
                                    status='Error : No Lightning Page';
                                }
                            })
                        })

                        
                    }else if(data.Deploy == 'List Views')
                    {
                        console.log('Deploying List Views');
                        if(metadata.listViews!=undefined){
                            if( metadata.listViews.length !=undefined ){

                                createFile(data, FileName, 'ListView', metadata.listViews, 'objects');
                            }
                            else{
                                let ar=[metadata.listViews];
                                createFile(data, FileName, 'ListView', ar, 'objects');
                            }
                        }else if(metadata.length!=undefined){

                            var sendingAr=[];
                            var relatedObj=[];

                            metadata.forEach(ele=>{
                                if(ele.listViews!=undefined && ele.fullName==data.objUsed){
                                    if(ele.listViews.length!=undefined){
                                        sendingAr=ele.listViews;
                                    }else{
                                        sendingAr.push(ele.listViews);
                                    }
                                }else if(ele.listViews!=undefined){
                                    relatedObj.push(ele);
                                }
                            })

                            if(sendingAr.length!=0){
                                createFile(data, FileName, 'ListView', sendingAr, 'objects',undefined,undefined,relatedObj);
                            }else{
                                status = 'Error-No listViews';
                            }
                        }
                        else    status = 'Error-No listViews';
                    }else if(data.Deploy == 'Permission Sets/Profile')
                    {
                        var temp={};
                        console.log('Getting Permissions Sets and Profile');
                        conn.query( "SELECT Id, Name,NamespacePrefix,Label FROM PermissionSet", function(err, result1) {
                            console.log('Got ',result1.records.length,' permissions...');
                            var gArr = [];
                            if( result1.records != undefined ){

                                result1.records.forEach(ele=>{
                                    if(ele.NamespacePrefix!=null){
                                        ele.Name=ele.NamespacePrefix+'__'+ele.Name;
                                    }
                                })

                                for( var val of result1.records ){
                                    if( val.Label != undefined ){
                                        if( !val.Label.startsWith('0') )
                                            gArr.push( val.Name );
                                    }
                                }
                                conn.query("SELECT Id,Name FROM Profile",function(err,result2){
                                    console.log('Got ',result2.records.length,' profile');
                                    var profArr=[];
                                    if(result2.records!=undefined)
                                    {
                                        result2.records.forEach(ele=>{
                                            profArr.push(ele.Name);
                                        })
                                        var g = {PermissionDetails : gArr,Profile:profArr}
                                        status = g;
                                    }
                                })
                            }
                        });
                    }else if(data.Deploy == 'FinalDashboard')
                    {
                        console.log('Deploying Dashboard');
                        var folDas={};
                        
                        conn.query('SELECT Id,DeveloperName,FolderName,NamespacePrefix FROM Dashboard ',async function(err,result){
                            var dashBoard=result.records;

                            dashBoard.forEach(ele=>{
                                if(ele.NamespacePrefix!=null){
                                    ele.DeveloperName=ele.NamespacePrefix+'__'+ele.DeveloperName;
                                }
                            })

                            if(err)
                            {
                                console.log(err);
                            }
                            conn.query('SELECT Id,Name,DeveloperName,NamespacePrefix FROM Folder ',async function(err,result){
                                if(err)
                                {
                                    console.log(err);
                                }
                                var fol=result.records;


                                fol.forEach(ele=>{
                                    if(ele.NamespacePrefix!=null){
                                        ele.DeveloperName=ele.NamespacePrefix+'__'+ele.DeveloperName;
                                    }
                                })

                                let rep={};
                                dashBoard.forEach(d=>{
                                    if(data.GroupsNames.includes(d.DeveloperName))
                                    {
                                        if(rep[d.FolderName]!=null&&rep[d.FolderName]!=undefined)
                                        {
                                            let temp=rep[d.FolderName];
                                            temp.push(d);
                                            rep[d.FolderName]=temp;
                                        }
                                        else
                                        {
                                            let temp=[];
                                            temp.push(d);
                                            rep[d.FolderName]=temp;
                                        }
                                    }
                                });
    
                                fol.forEach(f=>{
                                    if(rep[f.Name]!=null)
                                    {
                                        folDas[f.DeveloperName]=rep[f.Name];
                                    }
                                });

                                createFolder(data, FileName, 'Dashboard',undefined, 'dashboards',folDas)
                            })
                        })
                    }else if(data.Deploy == 'FinalReports')
                    {
                        console.log('Deploying Reports');

                        var folRep={};
    
                        conn.query('SELECT Name,Id,DeveloperName,FolderName,NamespacePrefix FROM Report ',async function(err,result){
                            var reports=result.records;

                            reports.forEach(ele=>{
                                if(ele.NamespacePrefix!=null){
                                    ele.DeveloperName=ele.NamespacePrefix+'__'+ele.DeveloperName;
                                }
                            })

                            if(err)
                            {
                                console.log(err);
                            }
                            conn.query('SELECT Id,Name,DeveloperName,NamespacePrefix FROM Folder',async function(err,result){
    
                                if(err)
                                {
                                    console.log(err);
                                }
                                var fol=result.records;

                                fol.forEach(ele=>{
                                    if(ele.NamespacePrefix!=null){
                                        ele.DeveloperName=ele.NamespacePrefix+'__'+ele.DeveloperName;
                                        console.log(ele);
                                    }
                                })
                                
    
                                let rep={};
                                reports.forEach(r=>{
                                    if(data.GroupsNames.includes(r.DeveloperName))
                                    {
                                     
                                        if(r.FolderName=='Public Reports'){

                                            if(rep['unfiled$public']!=null&&rep['unfiled$public']!=undefined)
                                            {
                                                let temp=rep['unfiled$public'];
                                                temp.push(r);
                                                rep['unfiled$public']=temp;
                                            }
                                            else
                                            {
                                                let temp=[];
                                                temp.push(r);
                                                rep['unfiled$public']=temp;
                                            }
                                        }
                                        else if(rep[r.FolderName]!=null&&rep[r.FolderName]!=undefined)
                                        {
                                            let temp=rep[r.FolderName];
                                            temp.push(r);
                                            rep[r.FolderName]=temp;
                                        }
                                        else
                                        {
                                            let temp=[];
                                            temp.push(r);
                                            rep[r.FolderName]=temp;
                                        }
                                    }
                                });
    
    
                                fol.forEach(f=>{
                                    if(rep[f.Name]!=null)
                                    {
                                        folRep[f.DeveloperName]=rep[f.Name];
                                    }
                                })

                                if(rep['unfiled$public']!=null&&rep['unfiled$public']!=undefined){
                                    folRep['unfiled$public']=rep['unfiled$public'];
                                }

                                createFolder(data, FileName, 'Reports',undefined, 'reports\\TestFolder',folRep);
                                
                            })
                        })
                        
                    }else if(data.Deploy == 'Reports')
                    {
                        console.log('Getting Reports');
                        conn.query( "SELECT Id, Name,DeveloperName,NamespacePrefix FROM Report where FolderName!='Private Reports'", function(err, result1) {
                            console.log('Got ',result1.records.length,' Reports...');

                            result1.records.forEach(ele=>{
                                if(ele.NamespacePrefix!=null){
                                    ele.DeveloperName=ele.NamespacePrefix+'__'+ele.DeveloperName;
                                }
                            })

                            var gArr = [];
                            if( result1.records != undefined ){
                                for( var val of result1.records ){
                                    if( val.Name != undefined ){
                                        gArr.push( {name:val.Name,id:val.DeveloperName} );
                                    }
                                }
                                var g = {ReportDetails : gArr};
                                status = g;
                            }
                        });
                    }else if(data.Deploy == 'Dashboard')
                    {
                        console.log('Getting Dashboard');
                        conn.query( "SELECT Id, Title,DeveloperName,NamespacePrefix FROM Dashboard where FolderName!='Private Dashboards'", function(err, result1) {
                            console.log('Got ',result1.records.length,' Dashboards...');

                            result1.records.forEach(ele=>{
                                if(ele.NamespacePrefix!=null){
                                    ele.DeveloperName=ele.NamespacePrefix+'__'+ele.DeveloperName;
                                }
                            })

                            var gArr = [];


                            if( result1.records != undefined ){
                                for( var val of result1.records ){
                                    gArr.push( {name:val.Title,id:val.DeveloperName} );
                                }
                                var g = {DashboardDetails : gArr};
                                status = g;
                            }
                        });
                    }else if(data.Deploy == 'Sharing Settings')
                    {
                        console.log('Deploying Sharing Settings');
                        createFile(data, FileName, 'Settings', undefined, 'sharingRules');
                    }else if(data.Deploy == 'Groups')
                    {
                        console.log('Getting Groups');
                        conn.query( "SELECT Id, DeveloperName, Related.Name, Name FROM Group", function(err, result1) {
                            var changed=[];
                            console.log('Got ',result1.records.length,' Group...');
                            var gArr = [];
                            if( result1.records != undefined ){
                                for( var val of result1.records ){
                                    if( val.Related != undefined ){
                                        if( val.Related.Name != 'Config Item Site Guest User' && val.Related.Name != 'Config Item Site Site Guest User' )
                                            gArr.push( val.DeveloperName );
                                    }else{
                                        gArr.push( val.DeveloperName );
                                    }
                                }
                                let set=new Set(gArr);
                                gArr=[];
                                gArr=Array.from(set);
                                var g = {GroupDetails : gArr}
                                status = g;
                            }
                        });
                    }else if(data.Deploy == 'Custom Settings')
                    {
                        console.log('Getting Custom Settings');
                        conn.query( "SELECT Id, Label, MasterLabel, PluralLabel, DeveloperName, QualifiedApiName, KeyPrefix, NamespacePrefix FROM EntityDefinition WHERE IsCustomSetting = true", function(err, result1) {
                            console.log('Got ',result1.records.length,' CustomSettings...');
                            var gArr = [];


                            if( result1.records != undefined ){

                                result1.records.forEach(ele=>{
                                    if(ele.NamespacePrefix!=null){
                                        ele.DeveloperName=ele.NamespacePrefix+'__'+ele.DeveloperName;
                                    }
                                })

                                for( var val of result1.records ){
                                    gArr.push( val.QualifiedApiName );
                                }
                                var g = {GroupDetails : gArr}
                                status = g;
                            }
                        });
                    }else if( data.Deploy == 'FinalGroups' ){
                        console.log('Deploying Groups');
                        if( data.GroupsNames != undefined ){
                            var gNames = data.GroupsNames;
                            gNames = gNames.replaceAll( '[', '' );
                            gNames = gNames.replaceAll( ']', '' );
                            var gNamesArr = gNames.split(',');
                            createFile(data, FileName, 'Group', gNamesArr, 'groups');
                        }else{
                            status = 'Error-Please select items to deploy';
                        }
                    }else if( data.Deploy == 'FinalCustomSettings' ){

                        console.log('Deploying Custom Setting');
                        if( data.GroupsNames != undefined ){
                            var gNames = data.GroupsNames;
                            gNames = gNames.replaceAll( '[', '' );
                            gNames = gNames.replaceAll( ']', '' );
                            var gNamesArr = gNames.split(',');
                            createFile(data, FileName, 'CustomObject', gNamesArr, 'objects');
                        }else{
                            status = 'Error-Please select items to deploy';
                        }
                    } else if( data.Deploy == 'FinalPermissionSets/Profile' ){
                        console.log('Deploying Permission Sets and Profile');

                        if( data.GroupsNames != undefined ){
                            var gNames = data.GroupsNames;
                            gNames = gNames.replaceAll( '[', '' );
                            gNames = gNames.replaceAll( ']', '' );
                            var gNamesArr = gNames.split(',');
                            createFile(data, FileName, 'PermissionSet', gNamesArr, 'permissionsets');
                        }
                        else if(data.Profiles != undefined)
                        {
                            var pNames = data.Profiles;
                            pNames = pNames.replaceAll( '[', '' );
                            pNames = pNames.replaceAll( ']', '' );
                            var pNamesArr = pNames.split(',');
                            createProfile(data, FileName, 'Profile', pNamesArr, 'profiles');
                        }
                    }
                }
            });
        });
    });
    app.post( "/getSourceTargets", ( req, res )=>{

        console.log('STARTING getSourceTargets ');

        if(fs.existsSync('./unpackaged')){
            fs.rmdir('./unpackaged', { recursive: true }, err => {
                if (err) {
                  throw err
                }
            })
        }
        try{
            status="Fetching source targets...";
            res.send( status );
            const data = req.body;
            var conn = new jsforce.Connection({
                loginUrl : 'https://test.salesforce.com'
            });
            
            
            conn.login(data.userName, data.password+data.sToken, function(err, userInfo) {
                if (err) { 
                    status = 'error Wrong Password or Security Token in Sandbox';
                    return console.error(err); 
                }
                console.log(err);
                var mData=[];
                var fullNames = [ data.objUsed ];
                console.log('Fetching Fields');
                conn.metadata.read('CustomObject', fullNames, function(err, metadata) {
                    console.log('FULLNAME : '+fullNames);
                    if( metadata != undefined ){
                        var conn2 = new jsforce.Connection({
                            loginUrl : productionLogin
                        });
                        conn2.login(data.CustProductionUserName, data.custPRoductionPassword+data.custProductionSecurtiy, function(err, userInfo) {
                            if (err) { 
                                status = 'error Wrong Password or Security Token in Production';
                                return console.error(err); 
                            }
                            console.log('err : ',err);
                            console.log('Logged : ',userInfo);
                            conn2.metadata.read('CustomObject', fullNames, function(err, metadata2) {
                                console.log('fullNames : ',fullNames);
                                if( metadata2 != undefined ){
                                    
                                    if(metadata.fields!=undefined){

                                        if(metadata2.fields==undefined){

                                            if(metadata.fields.length!=undefined)
                                            {
                                                mData.push( {fieldName:'Fields',source:metadata.fields.length,target:0} ); 
                                                
                                            }
                                            else{
                                                mData.push( {fieldName:'Fields',source:1,target:0} ); 
                                            }
                                        }else{

                                            if(metadata2.fields.length!=undefined){
                                                mData.push( {fieldName:'Fields',source:metadata.fields.length,target:metadata2.fields.length} ); 
                                            }
                                            else{
                                                mData.push( {fieldName:'Fields',source:1,target:1} ); 
                                            }
                                        }   

                                    }else if(metadata2.field!=undefined){

                                        if(metadata2.fields.length!=undefined)
                                        {
                                            
                                            mData.push( {fieldName:'Fields',source:0,target:metadata2.fields.length} ); 
                                            
                                        }
                                        else{
                                            mData.push( {fieldName:'Fields',source:0,target:1} ); 
                                        }

                                    }else{

                                        mData.push({fieldName:'Fields',source:0,target:0});

                                    }

                                    
                                    //Layout Length
                                    console.log('Fetching Layout Outer');
                                    conn.query("SELECT id,DurableId, QualifiedApiName FROM EntityDefinition WHERE QualifiedApiName like '"+data.objUsed+"'",function(err,objRecords1){

                                        conn2.query("SELECT id,DurableId, QualifiedApiName FROM EntityDefinition WHERE QualifiedApiName like '"+data.objUsed+"'",function(err,objRecords2){


                                            let objName1=objRecords1.records[0].DurableId;
                                            let objName2=objRecords2.records[0].DurableId;

                                            
                                            console.log('Fetching Layout');
                                            conn.tooling.sobject('Layout')
                                            .find({ TableEnumOrId: objName1 }, "Name")
                                            .execute(function(err, records) {

                                                conn2.tooling.sobject('Layout')
                                                .find({ TableEnumOrId: objName2 }, "Name")
                                                .execute(function(err, records2) {
        
                                                    mData.push( {fieldName:'Layout',source:records.length,target:records2.length} ); 
        
                                                    console.log('Fetching List Views');
                                                    if(metadata.listViews!=undefined){
        
                                                        if(metadata2.listViews==undefined){
            
                                                            if(metadata.listViews.length!=undefined)
                                                            {
                                                                mData.push( {fieldName:'List Views',source:metadata.listViews.length,target:0} ); 
                                                                
                                                            }
                                                            else{
                                                                mData.push( {fieldName:'List Views',source:1,target:0} ); 
                                                            }
                                                        }else{
                                                            if(metadata2.listViews.length!=undefined){
                                                                if(metadata.listViews.length!=undefined){
                                                                    mData.push( {fieldName:'List Views',source:metadata.listViews.length,target:metadata2.listViews.length} ); 
                                                                }
                                                                else{
                                                                    mData.push( {fieldName:'List Views',source:1,target:metadata2.listViews.length} ); 
                                                                }
                                                            }
                                                            else{
                                                                mData.push( {fieldName:'List Views',source:1,target:1} ); 
                                                            }
                                                        }   
            
                                                    }else if(metadata2.listViews!=undefined){
            
                                                        if(metadata2.listViews.length!=undefined)
                                                        {
                                                            
                                                            mData.push( {fieldName:'List Views',source:0,target:metadata2.listViews.length} ); 
                                                            
                                                        }
                                                        else{
                                                            mData.push( {fieldName:'List Views',source:0,target:1} ); 
                                                        }
            
                                                    }else{
            
                                                        mData.push({fieldName:'List Views',source:0,target:0});
            
                                                    }
        
                                                    console.log('Fetching Lightning Pages');
                                                    conn.tooling.sobject('FlexiPage').find({ EntityDefinitionId : objName1 ,Type:"RecordPage"}).select('DeveloperName,MasterLabel,EntityDefinitionId,Type').execute(function(err, records) {
                                                        if (err) { return console.error(err); }
        
                                                        conn2.tooling.sobject('FlexiPage').find({ EntityDefinitionId : objName2 ,Type:"RecordPage"}).select('DeveloperName,MasterLabel,EntityDefinitionId,Type').execute(function(err, reco) {
                                                            if (err) { return console.error(err); }
        
                                                            if(records!=undefined&&reco!=undefined){
                                                                mData.push({fieldName:'Lightning Page',source:records.length,target:reco.length});
                                                            }else{
                                                                mData.push({fieldName:'Lightning Page',source:'-',target:'-'});
                                                            }
                                                            
                                                            //gROUPS lENGTH
                                                            console.log('Fetching Groups');
                                                            conn.query( "SELECT Id, DeveloperName, Related.Name, Name FROM Group", function(err, result1) {
                                                                conn2.query( "SELECT Id, DeveloperName, Related.Name, Name FROM Group", function(err, result2) {
                                                                    mData.push({fieldName:'Groups',source:result1.records.length,target:result2.records.length});
                                                                    console.log('Fetching Permission Set');
                                                                    conn.query( "SELECT Id, Name, Label FROM PermissionSet", function(err, resultP) {
                                                                        conn2.query( "SELECT Id, Name, Label FROM PermissionSet", function(err, resultP2) {
                                                                            mData.push({fieldName:'Permission Sets/Profile',source:resultP.records.length,target:resultP2.records.length});
                                                                            console.log('Fetching Sharing Rules');
                                                                            var fullNames = [data.objUsed];
                                                                            conn.metadata.read('CustomObject', fullNames, function(err, metadat) {
                                                                                if (err) { console.error(err); }
                                                                                conn2.metadata.read('CustomObject', fullNames, function(err, metadat2) {
                                                                                    if (err) { console.error(err); }
                                                                                    try{
                                                                                        if(metadat!=undefined&&metadat2!=undefined){
                                                                                            mData.push({fieldName:'Sharing Settings',source:metadata.sharingModel,target:metadata2.sharingModel});
                                                                                        }else{
                                                                                            mData.push({fieldName:'Sharing Settings',source:'-',target:'-'});
                                                                                        }
                                                                                    }catch(e){
                                                                                        console.log(e);
                                                                                    }

                                                                                    console.log('Fetching Report');
                                                                                    conn.query( "SELECT Name,Id,DeveloperName,FolderName FROM Report where FolderName!='Private Reports'", function(err, resultPr) {
                                                                                        conn2.query( "SELECT Name,Id,DeveloperName,FolderName FROM Report where FolderName!='Private Reports'", function(err, resultPr2) {
                                                                                            mData.push({fieldName:'Reports',source:resultPr.records.length,target:resultPr2.records.length});
                                                                                            console.log('Fetching Dashboard');
                                                                                            conn.query( "SELECT Id,DeveloperName,FolderName FROM Dashboard where FolderName!='Private Dashboards'", function(err, resultPd) {
                                                                                                conn2.query( "SELECT Id,DeveloperName,FolderName FROM Dashboard where FolderName!='Private Dashboards'", function(err, resultPd2) {
                                                                                                    mData.push({fieldName:'Dashboard',source:resultPd.records.length,target:resultPd2.records.length});
                                                                                                    console.log("Fetching Custom Settings");
                                                                                                    conn.query('SELECT Id, Label, MasterLabel, PluralLabel, DeveloperName, QualifiedApiName, KeyPrefix, NamespacePrefix FROM EntityDefinition WHERE IsCustomSetting = true Order by QualifiedApiName',function(err,resultCus1){
                                                                                                        conn2.query('SELECT Id, Label, MasterLabel, PluralLabel, DeveloperName, QualifiedApiName, KeyPrefix, NamespacePrefix FROM EntityDefinition WHERE IsCustomSetting = true Order by QualifiedApiName',function(err,resultCus2){
                                                                                                            mData.push({fieldName:'CustomSettings',source:resultCus1.records.length,target:resultCus2.records.length});
                                                                                                            //CC
                                                                                                            try {
                                                                                                                let type = '('+'\''+data.objUsed+'\',';
                                                                                                                for( var i = 0; i<data.relatedObj.length; i++ ){
                                                                                                                    type+='\''+data.relatedObj[i]+'\',';
                                                                                                                }
                                                                                                                if( type.length > 1 )
                                                                                                                    type = type.slice(0, -1);
                                                                                                                type+=')';
                                                                                                                conn.query('SELECT Id FROM Simploud__Compliance_Configuration__c WHERE Simploud__Object_API_Name__c IN '+type,function(err,resultCus1){
                                                                                                                    conn2.query('SELECT Id FROM Simploud__Compliance_Configuration__c WHERE Simploud__Object_API_Name__c IN '+type,async function(err,resultCus2){
                                                                                                                        mData.push({fieldName:'Compliance',source:resultCus1.records.length,target:resultCus2.records.length});
                                                                                                                        getRelatedTask(data,conn,conn2,mData);    
                                                                                                                    });
                                                                                                                });
                                                                                                            } catch (error) {
                                                                                                                console.log(error);
                                                                                                            }
                                                                                                        })
                                                                                                    })
                                                                                                });
                                                                                            });
                                                                                        });
                                                                                    });
                                                                                })
                                                                            });
                                                                        });
                                                                    });   
                                                                });    
                                                            });                                    
                                                        });    
                                                    });
                                                }); 
                                            });
                                        })
                                    })

                                }
                            });
                        });
                    }
                });
            });
        }catch(err){
            console.log(err);
        }
    })

    async function getRelatedTask(data,conn,conn2,mData, btn){

        let complianceCompareTask=[];
        console.log('Getting Related Task');
        // console.log('DATA CC FIELDS : ',data.ccFields);
        var q2 =`SELECT Id, ${data.ccFields} FROM Simploud__Compliance_Configuration__c WHERE  Simploud__Setting_Type__c=\'Status Flow\' AND Simploud__Flow_Type__c = \'General/Training\' `;
        await conn.query(q2, async function(err, resultTask) {
            await conn2.query(q2, async function(err, resultTask2){
                if(resultTask2.records.length!=0){
                    sandMap={};
                    prodMap={};
                    resultTask.records.forEach(ele=>{
                        if(ele.Simploud__Record_Type__c!=undefined && ele.Simploud__Record_Type__c!=null ){
                            sandMap[ele.Simploud__Record_Type__c]=ele;
                        }
                    })
                    resultTask2.records.forEach(ele=>{
                        if(ele.Simploud__Record_Type__c!=undefined && ele.Simploud__Record_Type__c!=null ){
                            prodMap[ele.Simploud__Record_Type__c]=ele;
                        }
                    })

                    for( var val in sandMap ){
                        
                        if(prodMap[val]!=undefined){
                            
                            jsonMapSand=sandMap[val];
                            jsonMapProd=prodMap[val];
                            
                            for(var ele in jsonMapSand){
                                if(ele != 'attributes' && ele != 'Id' && ele != 'OwnerId' ){
                                    if(jsonMapProd[ele]!=jsonMapSand[ele] && !complianceCompareTask.includes(val)){
                                        complianceCompareTask.push(val);
                                    }
                                }
                            }

                        }else{
                            complianceCompareTask.push(val);
                        }
                        
                    }
                }else{
                    resultTask.records.forEach(ele=>{
                        if(ele.Simploud__Record_Type__c!=undefined && ele.Simploud__Record_Type__c!=null ){
                            complianceCompareTask.push(ele.Simploud__Record_Type__c);
                        }
                    })
                }
                if( btn == 'Deploy' ){
                    var gArr = [];
                    if( complianceCompareTask.length > 0 ){
                        for( var val of complianceCompareTask ){
                            gArr.push( val );
                        }
                    }
                    var g = {PermissionDetails : gArr}
                    status = g;
                }else if( btn == 'Entire' ){
                    var gArr = [];
                    for( var val of complianceCompareTask ){
                        gArr.push( val );
                    }
                    mData['task']=gArr;
                    status={};
                    status ={SelectGlobalItems: mData};
                }else{
                    mData.push({fieldName:'relatedTask',arr:complianceCompareTask});
                    var configs = { AllItems : mData };
                    status = configs;
                }
            })
        })

    }

    async function createFolder(data,FileName,config, configValues, cName,folderMap,dash,members)
    {
        console.log("Creating Folder");
        var fs = require('fs');
        var members='';
        var types;
        var content;

        var stream = fs.createWriteStream(FileName+".xml");
        stream.once('open', function(fd) {
            if(config=='Dashboard'){

                    types=`<types>`;
                    var k=Object.keys(folderMap);
                    k.forEach(ele=>{
                        
                        types+=`<members>${ele}</members>`;
                        
                    })
                    types+=`<name>Dashboard</name>
                            </types>`;

            }else if(config == 'Reports'){
                
            
                    types=`<types>`;
                    var k=Object.keys(folderMap);
                    k.forEach(ele=>{
                        if(ele!='unfiled$public')
                        {
                            types+=`<members>${ele}</members>`;
                        }  
                    })
                    types+=`<name>Report</name>
                            </types>`;
                
            }

            content=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <Package xmlns="http://soap.sforce.com/2006/04/metadata">
            ${types}
            <version>55.0</version>
            </Package>`;

            stream.write(
                content
            );
        // stream.write("My second row\n");
            stream.end();
        });
        setTimeout(()=>{
            (async () =>{
                const r = await backupData(data.userName, data.password, data.sToken, data.sandboxId, FileName );
                
                console.log('Retrive Result : ',r);
                if( r=='Success' ){
                    status='Retrieved Configurations';
                    //Create file inside zip
                    
                    await changeFolderXml( FileName, config, cName,folderMap, content,data,dash,members);
                    console.log('Folder Completed');
                    return 'Success';
                    // await changeFolderXml( FileName, config, cName,folderMap, content);
                }else{
                    status = r+' error';
                }
            })();
            
        },10000)

        
    }

    async function changeXml(data, FileName, config, cName,folderMap){
        try{
                if (fs.existsSync(FileName+'.zip')) {
                    const unzipper = require( 'unzipper' );
                    const archiver = require('archiver');
                    await fs.createReadStream(FileName+'.zip')
                    .pipe(
                        unzipper.Extract({ path: './' })
                    );
                }
            var types;
            if( config == 'Settings' ){
                types = `<types>
                            <members>*</members>
                            <name>SharingCriteriaRule</name>
                        </types>
                        <types>
                            <members>*</members>
                            <name>SharingOwnerRule</name>
                        </types>
                        <types>
                            <members>*</members>
                            <name>CustomObject</name>
                        </types>`;
            }else{
                types = `<types>
                            <members>*</members>
                            <name>${config}</name>
                        </types>`
            }
            setTimeout( ()=>{
                var fs = require('fs');
                var content = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                <Package xmlns="http://soap.sforce.com/2006/04/metadata">
                    ${types}
                    <version>55.0</version>
                </Package>`;

                if(config=='Reports'||config=='Dashboard'||config=='Layout')
                {
                    content=globalContent;
                }
    
                if (fs.existsSync(FileName+'.zip')) {


                    var stream = fs.createWriteStream("./unpackaged/package.xml");
                    stream.once('open', function(fd) {
                        stream.write( content );
                        stream.end();
                        
                        if(config=='Reports')
                        {
                            let key= Object.keys(folderMap);
                            key.forEach(k=>{
                                try
                                {
                                    var fs = require('fs');
                                    
                                    let key=folderMap[k];
                                    key.forEach(rep=>{
                                       

                                    if (fs.existsSync('unpackaged/reports/'+k+'/'+rep.DeveloperName+'.report')) {
                                        fs.rename('unpackaged/reports/'+k+'/'+rep.DeveloperName+'.report', 'unpackaged/reports/'+k+'/'+rep.DeveloperName+'.report-meta.xml',function (err) {
                                            if (err) {
                                                console.log('Error IN Changing name!! ',err);
                                            };
                                        });    
                                    }
                                    })
                                    zipper(FileName);                                 
                                }
                                catch(e)
                                {
                                    console.log(e);
                                }
                            });
                            
                        }else if(config=='Dashboard')
                        {
                            let key= Object.keys(folderMap);
                            key.forEach(k=>{
        
                                try
                                {   
                                    var fs = require('fs');
            
                                    let key=folderMap[k];
                                    key.forEach(rep=>{

                                        if (fs.existsSync('./unpackaged/dashboards/'+k+'/'+rep.DeveloperName+'.dashboard')) {
                                            var con = require('fs').readFileSync('./unpackaged/dashboards/'+k+'/'+rep.DeveloperName+'.dashboard', 'utf8');
                                            var xmlFormat;
                                            xml.parseString(con, function (err, result) {
                                                
                                                delete result.Dashboard['$'];
                                                if(result.Dashboard.runningUser!=null||result.Dashboard.runningUser!=undefined)
                                                {
                                                    delete result.Dashboard['runningUser'];
                                                }
                                                if(result.Dashboard.dashboardType!=null||result.Dashboard.dashboardType!=undefined)
                                                {
                                                    delete result.Dashboard['dashboardType'];
                                                }
                    
                                                const builder=new xml.Builder();
                                                xmlFormat=builder.buildObject(result);   
                                            });
                                            
                                            
                                            
                                            
                                            fs.rename('unpackaged/dashboards/'+k+'/'+rep.DeveloperName+'.dashboard', 'unpackaged/dashboards/'+k+'/'+rep.DeveloperName+'.dashboard-meta.xml',function (err) {
                                                if (err) {
                                                    console.log('Error IN Changing Name');
                                                };
                                            });
            
            
            
                                            var stream10 = fs.createWriteStream('./unpackaged/dashboards/'+k+'/'+rep.DeveloperName+'.dashboard-meta.xml');
                                            stream10.once('open', function(fd) {
                                                stream10.write(  xmlFormat );
                                                stream10.end();
                                                zipper(FileName);
                                            })
                                        }

                                        
                                    })
                                }
                                catch(e)
                                {
                                    console.log(e);
                                }
                            });
                        }else if( config == 'Settings' ){

                            if (fs.existsSync("./unpackaged/objects/package.xml")) {
                                var stream2 = fs.createWriteStream("./unpackaged/objects/package.xml");
                                stream2.once('open', function(fd) {
                                    stream2.write( content );
                                    stream2.end();

                                    if (fs.existsSync("./unpackaged/objects/"+data.objUsed+".object")) {
                                        fs.readFile("./unpackaged/objects/"+data.objUsed+".object", 'utf8', (err, owdData) => {
                                            if (err) {
                                                console.log(err);
                                            }
                                            //Converting in JSON the 1st file in zip file(Account.layout)
                                            xml.parseString(owdData, function (err, results) {
                                                var owdJson = JSON.stringify(results);
                                                owdJson = JSON.parse(owdJson);
                                                var extModel = owdJson.CustomObject.externalSharingModel[0];
                                                var sharModel = owdJson.CustomObject.sharingModel[0];
                                                var objContent = `<?xml version="1.0" encoding="UTF-8"?>
                                                <CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
                                                <sharingModel>${sharModel}</sharingModel>
                                                <externalSharingModel>${extModel}</externalSharingModel>
                                                </CustomObject>`;
                                                var stream3 = fs.createWriteStream("./unpackaged/objects/"+data.objUsed+".object");
                                                stream3.once('open', function(fd) {
                                                    stream3.write( objContent );
                                                    stream3.end();
                                                });
                                            });
                                        });

                                    }
                                });
                            }

                        }else{
                            if (fs.existsSync("./unpackaged/"+cName)) {
                                var stream1 = fs.createWriteStream("./unpackaged/"+cName+"/package.xml");
                                stream1.once('open', function(fd) {
                                    stream1.write( content );
                                    stream1.end();


                                    if(cName=='layouts'){

                                        if(fs.existsSync("./unpackaged/quickActions")){
                                            var stream2 = fs.createWriteStream("./unpackaged/quickActions/package.xml");
                                            stream2.once('open', function(fd) {
                                                stream2.write( content );
                                                stream2.end();

                                                if(fs.existsSync("./unpackaged/objects")){
                                                    var stream3 = fs.createWriteStream("./unpackaged/objects/package.xml");
                                                    stream3.once('open', function(fd) {
                                                        stream3.write( content );
                                                        stream3.end();
                                                        zipper(FileName);
                                                    })
                                                }else{
                                                    zipper(FileName);
                                                }
                                            })
                                            
                                        }else if(fs.existsSync("./unpackaged/objects")){
                                            var stream3 = fs.createWriteStream("./unpackaged/objects/package.xml");
                                            stream3.once('open', function(fd) {
                                                stream3.write( content );
                                                stream3.end();
                                                zipper(FileName);
                                            })
                                        }else{
                                            zipper(FileName);
                                        }
                                    }else{
                                        zipper(FileName);
                                    }
                                });
                            }
                            else{
                                console.log("./unpackaged/"+cName+"/package.xml Does Not Exist");
                            }
                        }
                    });
                }else{
                    console.log(FileName+' does not exist');
                }
            },1000);
        }catch( err ){
            console.log(err);
        }    
    }

    function zipper(FileName){
        const output = fs.createWriteStream(FileName+'.zip');
        const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });
        archive.pipe(output);
        archive.directory('./unpackaged', 'unpackaged');
        archive.finalize();
    }

    async function deployData( userName, password, sToken, orgId,fileName ){
        try{

            password=password.replaceAll('$','\\$');
            password=password.replaceAll('(','\\(');
            password=password.replaceAll(')','\\)');
            // console.log('PASSWORD : ',password);
            console.log('Deploying Configuration');
            status='Deploying Configuration';
            const command = 'jsforce-deploy -u '+userName+' -p '+password+sToken+' -Z ./'+fileName+'.zip --rollbackOnError true --pollTimeout 1000000ms --pollInterval 10000ms '+this.prod;
            const { stdout, stderr } = await exec(command);

            console.log('Error : ',stderr);

            if (fs.existsSync(fileName+'.xml')) {
                fs.unlink(fileName+'.xml', function (err) {
                    if (err) throw err;
                });
            }

            if (fs.existsSync(fileName+'.zip')) {
                fs.unlink(fileName+'.zip', function (err) {
                    if (err) throw err;
                });
            }
            if (fs.existsSync(fileName+'prod.zip')) {
                fs.unlink(fileName+'prod.zip', function (err) {
                    if (err) throw err;
                });
            }
            if (fs.existsSync('./unpackaged')) {
                fs.rm('./unpackaged', { recursive: true }, (err) => {
                    if (err) {
                        throw err;
                    }
                });
            }

            console.log( '------->', stdout );
            if( stdout.includes('Succeeded') && !stdout.includes('Partially') ){
                return 'Deploy';
            }else{
                return stdout+' error';
            }
        }catch( err ){
            console.log( '--------++++++++>>>>>', err );
            return err.stdout;
        }
    }
    async function backupData( userName, password, sToken, orgid, fileName, backUp, compareProd){
        try{
            password=password.replaceAll('$','\\$')
            password=password.replaceAll('(','\\(')
            password=password.replaceAll(')','\\)')
            // console.log('PASSWORD : ',password);
            console.log('Retriving Configuration');
            var command = 'jsforce-retrieve -u '+userName+' -p '+password+sToken+' -P ./'+fileName+'.xml -Z ./'+fileName+'.zip --pollTimeout 1000000ms --pollInterval 10000ms '+this.sandbox;
            if( backUp != undefined ){
                command = 'jsforce-retrieve -u '+userName+' -p '+password+sToken+' -P ./'+'package.xml -Z ./'+fileName+'.zip --pollTimeout 1000000ms --pollInterval 10000ms '+this.sandbox;
            }   
            if( compareProd ){
                command = 'jsforce-retrieve -u '+userName+' -p '+password+sToken+' -P ./'+fileName+'.xml -Z ./'+fileName+'prod.zip --pollTimeout 1000000ms --pollInterval 10000ms '+this.prod;
            }

            status='Retrieving Configurations';
            
            const { stdout, stderr } = await exec(command);
            if( stdout.includes('Succeeded') ){
                return 'Success';
            }else{
                status='Error-'+stderr;
                return 'Failed';
            }
        }catch( err ){
            console.log('error',err);
            status=err;
            return err.stderr;
        }
    }
    async function getAccessToken(orgLoginUrl){
        var responseBody;
        var loginUrl = orgLoginUrl + accessTokenPath;
        let params = {
            "refresh_token":refreshToken,
            "client_id":cId,
            "client_secret":cSecret,
            "grant_type":"refresh_token"
        }
        var query = "";
        for (key in params) {
            query += encodeURIComponent(key)+"="+encodeURIComponent(params[key])+"&";
        }
        await fetch(loginUrl, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: query
        }).then(response => {
            // console.log('RESPONSE JSON : ',response);
            return response.json();
        }).then( resBody => {
            responseBody = resBody;
            console.log('RESPONSE BODY : ', responseBody);
        } ).catch(err => {console.log('ERR IN GET ACCESS TOKEN : ',err);});
        return responseBody;
    }
    function createConfigItem( recsInfo, username, password ){
        console.log('Getting Access...');
        setTimeout( ()=>{
            var instance = recsInfo.instance; 
            if( instance == 'QMS' ){
                console.log('INSTANCE : QMS');
                var conn = new jsforce.Connection({
                    loginUrl : recsInfo.loginUrl
                });
                conn.login(username, password, function(err, userInfo) {
                    console.log(err);
                    if (err) { 
                        status = 'error Wrong Password or Security Token in Sandbox';
                        return console.error(err); 
                    }
                    console.log('Access Grant of Customer Org...');
                    console.log('Querying Simploud Success user...');
                    conn.query( "SELECT SmallPhotoUrl, Id, Name FROM User Where Name LIKE '%Simploud Success%' Limit 1", function(err, result1) {
                        console.log('Got '+result1.records.length+' simploud success user...');
                        var pUrlRec;
                        if(result1.records.length > 0){
                            pUrlRec = result1.records[0];
                        }
                        diffLoginsForConfigItem( recsInfo, instance, conn, pUrlRec );
                    });
                });
            }else if( instance == 'Customer' ){
                console.log('INSTANCE : CUSTOMER');
                getAccessToken( productionLogin ).then( resBody =>{
                    console.log('INSTANCE URL : ',resBody.instance_url)
                    var conn = new jsforce.Connection({
                        instanceUrl : resBody.instance_url,
                        accessToken : resBody.access_token
                    });
                    console.log('Access Grant of QMS Org...');
                    diffLoginsForConfigItem( recsInfo, instance, conn );
                } );
            }
        }, 20000 );
    }
    function decryptCreds( encryptText ){
        const crypto = require('crypto');
        var key = 'SIMPLWEBHOOKSP'+prodOrgId;
        var iv = prodOrgId.substring(0,16);

        const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv));
        let decryptedData = decipher.update(encryptText, "base64", "utf-8");
        decryptedData += decipher.final("utf8");
        return decryptedData;
    }
    function diffLoginsForConfigItem( recsInfo, instance, conn, userPhotoUrl ){

        const recs = recsInfo.data;
        // console.log('RECS INFO : ',recs);
        var qmsImportedIdDiscussionMap = {};
        var customerImportedIdDiscussionMap = {};
        var query = "SELECT Id,Imported_Record_Id__c, Simploud__Discussion__c, Stop_Recursion__c FROM Simploud__Configuration_Item__c WHERE Imported_Record_Id__c IN (";
        recs.forEach( configItem =>{
            configItem.Simploud__Release_Date__c = new Date(configItem.Simploud__Release_Date__c);
            configItem.Simploud__Date_Closed__c = new Date( configItem.Simploud__Date_Closed__c );
            configItem.Simploud__Target_Date__c = new Date( configItem.Simploud__Target_Date__c );
            query += '\''+configItem.Imported_Record_Id__c+'\',';
            console.log('JSON PARSE : ',configItem.Simploud__Discussion__c);
            if( instance == 'Customer' ){
                if( configItem.Simploud__Discussion__c != null && configItem.Simploud__Discussion__c != '' && configItem.Simploud__Discussion__c != undefined ){
                    customerImportedIdDiscussionMap[configItem.Imported_Record_Id__c] = JSON.parse(configItem.Simploud__Discussion__c);
                }
            }else if( instance == 'QMS' ){
                if( configItem.Simploud__Discussion__c != null && configItem.Simploud__Discussion__c != '' && configItem.Simploud__Discussion__c != undefined ){
                    qmsImportedIdDiscussionMap[configItem.Imported_Record_Id__c] = JSON.parse(configItem.Simploud__Discussion__c);
                }
            }           
        } );
        if( recsInfo.eventAction == 'updation' ){

            console.log('IN UPDATION');
            query = query.slice(0, -1);
            query+=')';
            var records = [];
            var iRecIdRecursion = {};
            conn.query(query, function(err, result) {
                if (err) { return console.error('ERROR IN QUERY : ',err); }
                records = result.records;
                console.log('No. of records : '+ records.length)
                if( records.length > 0 ){
                    
                    try {
                        
                        if(recsInfo.message.fromApi==''||recsInfo.message.fromApi==undefined||recsInfo.message.fromApi==null)
                        {
                            var localContentDocumentId='';
                            
                            if(recsInfo.message.FileId!=null&&recsInfo.message.FileId!=undefined&&recsInfo.message.FileId!='')
                            {
                                localContentDocumentId=globalContentDocumentId[recsInfo.message.FileId];
                                delete globalContentDocumentId[recsInfo.message.FileId];
                            }
                            
                            
                            var msg=recsInfo.message.lastMessage
                            
                            createMessage=[
                                {
                                    Simploud__Message__c:msg,
                                    Simploud__Configuration_Item__c:records[0].Id,
                                    Simploud__File_ID__c:localContentDocumentId,
                                    Simploud__Type__c:recsInfo.message.type,
                                    Simploud__External_ID__c:recsInfo.message.externalId,
                                    Simploud__Date_Sent__c:new Date(recsInfo.message.date),
                                    Simploud__Date_Sent_String__c:recsInfo.message.dateString,
                                    Simploud__External_Sender__c:recsInfo.message.UserName,
                                    Simploud__External_Sender_ID__c:recsInfo.UserId,
                                    Simploud__Success__c:true,
                                    fromApi__c: 'Recived'
                                }
                            ]
                            
                            
                            
                            if(recsInfo.instance=='Customer')
                            {   
                                
                                console.log('IN CUSTOMER');
                                var queryCon="select Id from contact where User_Id__c = '"+recsInfo.UserId+"'";
                                conn.query(queryCon,function(err,resultt){
                                    if(err)
                                    {return console.log(err);}
                                    if(recsInfo.instance!='QMS')
                                    {
                                        createMessage[0]['Simploud__Contact__c']=resultt.records[0].Id;
                                        createMessage[0]['Simploud__External_Sender_Photo__c']=recsInfo.message.PhotoUrl;
                                        
                                        console.log('to QMS');
                                    }
    
                                    conn.sobject('Simploud__Configuration_Item_Message__c').create(createMessage,function(err,res){
                                        console.log(err);
                                        console.log(res[0].errors);
                                        console.log('Message Id '+res[0].id);
                                        
                                    }) 
                                })
                            }
                            else{
                                
                                createMessage[0]['Simploud__Sender__c']=userPhotoUrl.Id;
                                
                                createMessage[0]['Simploud__External_Sender_Photo__c']=userPhotoUrl.SmallPhotoUrl;
                                
                                conn.sobject('Simploud__Configuration_Item_Message__c').create(createMessage,function(err,res){
                                    console.log(err);
                                    console.log(res[0].errors);
                                    console.log('Message Id '+res[0].id);
                                    
                                })
                            }
                            
                        }
                    } catch (error) {}

                    records.forEach( rec =>{
                        if( rec.Simploud__Discussion__c != null && rec.Simploud__Discussion__c != '' && rec.Simploud__Discussion__c != undefined ){
                            console.log('JSON PARSE : ',rec.Simploud__Discussion__c);
                            if( instance == 'QMS' ){
                                customerImportedIdDiscussionMap[rec.Imported_Record_Id__c] = JSON.parse(rec.Simploud__Discussion__c);
                            }else if( instance == 'Customer' ){
                                qmsImportedIdDiscussionMap[rec.Imported_Record_Id__c] = JSON.parse(rec.Simploud__Discussion__c);
                            }
                        }  
                        if( rec.Stop_Recursion__c == 'null' || rec.Stop_Recursion__c == null || rec.Stop_Recursion__c == '' ){
                            rec.Stop_Recursion__c = 'Updated 1';
                        } else{
                            if( rec.Stop_Recursion__c.endsWith('1') ){
                                rec.Stop_Recursion__c = rec.Stop_Recursion__c.replace( '1', '2' );
                            }else{
                                rec.Stop_Recursion__c = rec.Stop_Recursion__c.replace( '2', '1' );
                            }
                        }
                        iRecIdRecursion[rec.Imported_Record_Id__c] = rec.Stop_Recursion__c;
                    } ) 
                    recs.forEach( rec =>{
                        var sRec = iRecIdRecursion[rec.Imported_Record_Id__c];
                        rec.Stop_Recursion__c = sRec;
                        var qmsMapLen = qmsImportedIdDiscussionMap[rec.Imported_Record_Id__c] == undefined ? 0 : qmsImportedIdDiscussionMap[rec.Imported_Record_Id__c].length; 
                        var cusMapLen = customerImportedIdDiscussionMap[rec.Imported_Record_Id__c] == undefined ? 0 : customerImportedIdDiscussionMap[rec.Imported_Record_Id__c].length;
                        if( cusMapLen != qmsMapLen ){
                            console.log('JSON PARSE : ',rec.Simploud__Discussion__c);
                            var discussJson = JSON.parse(rec.Simploud__Discussion__c);
                            var fileId = discussJson[0].fileId;
                            if( instance == 'QMS' && userPhotoUrl != undefined ){
                                discussJson[0].responsible = userPhotoUrl.Name;
                                discussJson[0].photoUrl = userPhotoUrl.SmallPhotoUrl;
                                discussJson[0].userId = userPhotoUrl.Id;
                            }
                            if( fileId != null || fileId != undefined || fileId != 'null' || fileId != '' ){
                                discussJson[0].fileId = localContentDocumentId;
                            }
                            var dis = [];
                            if( instance == 'QMS' ){
                                dis = customerImportedIdDiscussionMap[rec.Imported_Record_Id__c] != undefined ? customerImportedIdDiscussionMap[rec.Imported_Record_Id__c]: dis;
                            } else if( instance == 'Customer' ){
                                dis = qmsImportedIdDiscussionMap[rec.Imported_Record_Id__c] != undefined ? qmsImportedIdDiscussionMap[rec.Imported_Record_Id__c]: dis;
                            }
                            dis.unshift( discussJson[0] );
                            // rec.Simploud__Discussion__c = JSON.stringify( dis );
                        }
                    } )
                }
            });
        }
        //Account
        setTimeout( ()=>{
            try{
                if( instance == 'Customer' ){
                    console.log('Querying Account Records...');
                    let beforeSlice=recsInfo.OrgId.toString();
                    console.log('Before SLICE : ',beforeSlice);
                    var oId = beforeSlice.slice(0,15);
                    console.log('After SLICE : ',oId);
                    var accQuery = "SELECT Id, Name, Simploud_Customer_Username__c, Simploud_Customer_Security_Token__c,Customer_Has_Production__c, Simploud_Customer_Password__c FROM Account WHERE Sandbox_Org_ID__c = '" + oId + "'";
                    
                    console.log('ACCOUNT QUERY : ',accQuery);
                    // console.log('CONN : ',conn);

                    conn.query(accQuery, function(err, result) {
                        
                        var accRecs = result.records;
                        console.log('QueryErr:',err);
                        console.log('Got '+accRecs.length+' Account Records!!');
                        if( accRecs.length > 0 ){
                            recs.forEach(rec => {
                                rec.Simploud__Customer__c = accRecs[0].Id;
                            });
                            var conQuery = "SELECT Id, Name FROM Contact WHERE AccountId = '" + accRecs[0].Id + "' AND User_Id__c = '" + recsInfo.UserId + "'";
                            console.log('Querying Contact Records...');
                            conn.query(conQuery, function(err1, result1) {
                                
                                
                                console.log('Got '+result1.totalSize+' Contact Records!');
                                if(result1.totalSize <= 0) {
                                    conn.sobject("Contact").create({ LastName : recsInfo.UserName, AccountId : accRecs[0].Id, User_Id__c : recsInfo.UserId }, function(err5, ret5) {
                                        console.log('Contact record created...');
                                    });
                                }
                            });
                            setTimeout( ()=>{
                                console.log('Creating CI Records in QMS...');
                                conn.sobject("Simploud__Configuration_Item__c").upsert(recs, 'Imported_Record_Id__c', function(err, ret) {
                                    
                                    console.error(err, ret);
                                    console.log('Created CI Records in QMS Org Successfully');

                                    // console.log(recsInfo);

                                    if(recsInfo.CreationSuccessful == "true"){
                                        var pass = decryptCreds( accRecs[0].Simploud_Customer_Password__c, recsInfo.OrgId );
                                        var token = decryptCreds( accRecs[0].Simploud_Customer_Security_Token__c, recsInfo.OrgId );
                                        var lUrl2;
                                        if( accRecs[0].Customer_Has_Production__c ){
                                            lUrl2 = 'https://login.salesforce.com';
                                        }else{
                                            lUrl2 = 'https://test.salesforce.com';
                                        }
                                        var conn2 = new jsforce.Connection({
                                            loginUrl : lUrl2
                                        });
                                        
                                        conn2.login(accRecs[0].Simploud_Customer_Username__c , pass+token, function(err, userInfo) {
                                            if (err) { 
                                                status = 'error Wrong Password or Security Token in Production';
                                                return console.error(err); 
                                            }
                                            console.log(err);
                                            if( err == null || err == undefined || err == '' ){
                                                console.log('Logged in Cus');
                                                var reverseRec = [];

                                                for(let i=0;i<recs.length;i++)
                                                {
                                                    reverseRec.push({Imported_Record_Id__c : recs[i].Imported_Record_Id__c , Simploud__External_ID__c: ret[i].id });
                                                }

                                                


                                                conn2.sobject("Simploud__Configuration_Item__c").upsert(reverseRec, 'Imported_Record_Id__c', function(err, ret) {
                                                    console.log('Reverse Upserted Successfully');
                                                    if (err || !ret.success) { return console.error(err, ret); }
                                                });

                                            }
                                        });
                                    }
                                });
                            }, 5000 );
                        }
                    });
                }else{ 
                    console.log('Creating CI Records in Customer');
                    conn.sobject("Simploud__Configuration_Item__c").upsert(recs, 'Imported_Record_Id__c', function(err, ret) {
                        console.log('Created CI Records in Customer Org Successfully');


                        if(recsInfo.CreationSuccessful == "true"){
                            getAccessToken( productionLogin ).then( resBody =>{
                                var conn2 = new jsforce.Connection({
                                    instanceUrl : resBody.instance_url,
                                    accessToken : resBody.access_token
                                });
                                console.log('Access Grant of Reverse  QMS Org...');
                                
                                var reverseRec = [];

                                for(let i=0;i<recs.length;i++)
                                {
                                    reverseRec.push({Imported_Record_Id__c : recs[i].Imported_Record_Id__c , Simploud__External_ID__c: ret[i].id });
                                }


                                conn2.sobject("Simploud__Configuration_Item__c").upsert(reverseRec, 'Imported_Record_Id__c', function(err, ret) {
                                    console.log('Reverse Upserted Successfully');
                                    if (err || !ret.success) { return console.error(err, ret); }
                                });
                                
                            });
                        }
                        if (!err || !ret.success) {
                            return console.error(err, ret);
                        }
                    });     
                }
            }catch( err1 ){
                console.log('Error while creating CI:', err1);
            }
        }, 25000 );
    }
    function createNotes( recsInfo, username, password ){
        var instance = recsInfo.instance; 
        if( instance == 'QMS' ){
            var conn = new jsforce.Connection({
                loginUrl : recsInfo.loginUrl
            });
            conn.login(username, password, function(err, userInfo) {
                if (err) { 
                    status = 'error Wrong Password or Security Token in Sandbox';
                    return console.error(err); 
                }
                diffLoginsForNotes( recsInfo, conn );
            });
        }else if( instance == 'Customer' ){
            getAccessToken( productionLogin/* recsInfo.loginUrl */ ).then( resBody =>{
                var conn = new jsforce.Connection({
                    instanceUrl : resBody.instance_url,
                    accessToken : resBody.access_token
                });
                diffLoginsForNotes( recsInfo, conn );
            } );
        }
    }
    function diffLoginsForNotes( recsInfo, conn ){
        for( var key in recsInfo.contentVersion ){
            var recId;
            var configItemQuery = 'SELECT Id FROM Simploud__Configuration_Item__c WHERE Imported_Record_Id__c = \''+key+'\'';
            console.log('Querying id of CI');
            conn.query(configItemQuery, function(err, result) {
                if (err) { return console.error(err); }
                console.log('Got CI records :', result.totalSize);
                recId = result.records[0].Id;
                console.log('Creating Content Version...');
                conn.sobject("ContentVersion").create( recsInfo.contentVersion[key], function(err, rets) {
                    if (err) { return console.error(err); }
                    var queryContentDocIds = 'SELECT ContentDocumentId,Title FROM ContentVersion WHERE Id IN (';
                    for (var i=0; i < rets.length; i++) {
                    if (rets[i].success) {
                        queryContentDocIds += '\''+rets[i].id+'\',';
                    }
                    }
                    queryContentDocIds = queryContentDocIds.slice(0, -1);
                    queryContentDocIds+=')';
                    console.log('Querying content doc Ids');
                    var contDocLinkRecs = [];
                    conn.query(queryContentDocIds, function(err, result) {
                        if (err) { return console.error(err); }
                        console.log("Got contDocIds total : ", result.totalSize);
                        contDocLinkRecs = result.records;
                        var contDocRecs = [];
                        globalContentDocumentId[recsInfo.ContentDocumentId]=contDocLinkRecs[0].ContentDocumentId;
                        if( recId != undefined ){
                            contDocLinkRecs.forEach( rec =>{
                                if( rec.ContentDocumentId != null || rec.ContentDocumentId != 'null' || rec.ContentDocumentId != '' || rec.ContentDocumentId != undefined ){
                                    var contDoc = {};
                                    contDoc.LinkedEntityId = recId;  
                                    contDoc.ContentDocumentId = rec.ContentDocumentId;
                                    contDocRecs.push( contDoc );
                                }
                            } );
                            console.log('Creating ',contDocRecs.length, ' Content DOC Links' );
                            if( contDocRecs.length > 0 ){
                                conn.sobject("ContentDocumentLink").create( contDocRecs, function(err, rets) {
                                    if (err) { return console.error(err); }
                                    console.log('ContentDocLinks created', err, rets);
                                });
                            }
                        }
                        
                    })
                });
            })
        }
    }
    function deleteConfigItem( recsInfo ){
        getAccessToken( productionLogin ).then( resBody =>{
            var conn = new jsforce.Connection({
                instanceUrl : resBody.instance_url,
                accessToken : resBody.access_token
            });
            console.log('Changing deleted checkbox in QMS...');
            conn.sobject("Simploud__Configuration_Item__c").upsert(recsInfo.data, 'Imported_Record_Id__c', function(err, ret) {
                if (err || !ret.success) {
                    console.log('error in Changing deleting status!', ret);
                    return console.error(err, ret);
                }
                console.log('Deleted Status changed Successfully');
                // ...
            });
        })
    }
    app.get("/api", (req, res) => {
        
        const data = req.query;
        console.log( 'Hello' );
        res.send('Get Called');
    });
} catch( err ){

    console.log('Error:',err);
}
