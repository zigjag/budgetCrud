  $(".category").change(function(){
    $(".A,.B").hide();
    if($(this).val() == "Income"){
      $(".A").show();
    }else{
       $(".B").show();
    }
  });
