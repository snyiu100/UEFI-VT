SELECT * FROM uefivt.module;

SELECT * FROM uefivt.module ORDER BY moduleID;

SELECT * FROM uefivt.module WHERE moduleUploadID = 12 or moduleuploadid= 15 or moduleuploadid= 10;

SELECT * FROM uefivt.module WHERE moduleUploadID = 12 ORDER BY moduleName;

SELECT moduleName, moduleGUID, moduleMD5, moduleSHA1, moduleSHA256 FROM module WHERE moduleUploadID = 3 ORDER BY moduleName;

SELECT COUNT(moduleName) AS NumberOfModules FROM module WHERE moduleUploadID=3;

SELECT moduleName, COUNT(*) c FROM module GROUP BY moduleName HAVING c > 1 ;

SELECT moduleName, COUNT(*) c FROM module WHERE moduleUploadID = 1 GROUP BY moduleName HAVING c > 1 ;

select * from module where moduleName = '<no_name>';

/*
Below adds unique indexing to module, prevent duplication of insertion
*/
ALTER TABLE `module` 
ADD UNIQUE INDEX `ix_module` (`moduleName`, `moduleGUID`, `moduleMD5`, `moduleSHA1`, `moduleSHA256`, `moduleUploadID`);