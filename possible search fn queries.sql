select * from upload where uploadName = 'searchStr';

select * from upload where uploadDate like "%searchstr%";

select * from analysis where analysisid like "%analysis4%";

select * from analysis where analysisName = 'searchstr';

select uploadname, uploaddate, analysisname, analysisreport
from upload
inner join analysis on uploadid = analysisid where analysisname like "%analysis4%";

select * from module where modulename = 'searchstr';

select uploadid, uploadname, uploaddate, modulename, moduleguid
from upload
inner join module on uploadid=moduleuploadid where moduleuploadid = 19
order by modulename;

SELECT * from upload where uploadName = 'searchStr';

select uploadname, uploaddate from uefivt.upload where
uploadname like "%searchStr%" or
uploaddate like "%searchStr%";

SELECT uploadName, analysisname, uploadDate 
FROM uefivt.upload 
inner join uefivt.analysis on uploadid = analysisuploadid
WHERE uploadID =3 or uploadID=5 or uploadID=7;
          

select analysisname, analysisreport from uefivt.analysis where
analysisname like "%found%" or
analysisreport like "%found%";

select uploadname as 'Upload Name', uploaddate as 'Upload Date', 
	analysisname as 'Analysis Name', analysisreport as 'Analysis Report', 
    modulename as 'Module Name', 
    moduleguid as 'Module GUID', modulemd5 as 'Module MD5', 
    modulesha1 as 'Module SHA1', modulesha256 as 'Module SHA256'
    from uefivt.module
inner join uefivt.upload on uploadid = moduleuploadid
inner join uefivt.analysis on analysisuploadid = moduleuploadid
where modulename like "%acpi%" or
moduleguid like"%acpi%" or
modulemd5 like "%acpi%" or
modulesha1 like "%acpi%" or
modulesha256 like "%acpi%" or
uploadname like "%acpi%" or 
analysisreport like "%acpi%";

select uploadname, uploaddate, analysisname, analysisreport from analysis 
inner join upload on uploadid = analysisuploadid where
analysisname like "%'+searchStr +'%" 
or analysisreport like "%'+searchStr +'%";


select uploadname, uploaddate from upload 
where uploadname like "%'+searchStr +'%"
or uploaddate like "%'+searchStr +'%";


/* Might need to change all statements to 'like' instead of 'where =' */
/* Might need to change like to contains for certain statements */

/*

select * from tableName where field like '%a%' or field like '%b%';

SELECT Orders.OrderID, Customers.CustomerName, Orders.OrderDate
FROM Orders
INNER JOIN Customers ON Orders.CustomerID=Customers.CustomerID;


(INNER) JOIN: Returns records that have matching values in both tables
LEFT (OUTER) JOIN: Return all records from the left table, 
	and the matched records from the right table
RIGHT (OUTER) JOIN: Return all records from the right table, 
	and the matched records from the left table
FULL (OUTER) JOIN: Return all records when there is a match 
	in either left or right table
*/


