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

select analysisname, analysisreport from uefivt.analysis where
analysisname like "%searchStr%" or
analysisreport like "%searchStr%";

select modulename, moduleguid, modulemd5, modulesha1, modulesha256 from uefivt.module where
modulename like "%searchStr%" or
moduleguid like"%searchStr%" or
modulemd5 like "%searchStr%" or
modulesha1 like "%searchStr%" or
modulesha256 like "%searchStr%";

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


