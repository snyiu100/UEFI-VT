console.log(" ### in0 ###");
$(function() {
  console.log(" ### in1 ###");
  
  $.get("/demo", function(string) {
    console.log(" ### in2 ###");
    //$('#fileResults').val(string);
    console.log("string is: "+string);
    $('#fileTextExt').val(string);
});
  

});