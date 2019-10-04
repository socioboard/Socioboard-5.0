<script>
    var currentPlan=$('#planInput').val();
    var newPlan =0;
    var planMode=0;
    $(document).on('click','.plan',function(){
        newPlan =this.id;
        if(newPlan < currentPlan){
            paymentUpgrade()

        }

//                $.ajax({
//                    url:'updatePlan',
//                    type:'POST',
//                    data:{
//                        "currentPlan":currentPlan,
//                        "newPlan":newPlan
//                    },
//                    success:function(response){
//
//                        /*
//                         * 200 success 202 success => redirect url
//                         * 401 not valid plan
//                         * 500 exception
//                         * 400 something wrong */
//                        if(response.code === 202){
//                            document.location.href = response.redirectUrl;
//                        }else if(response.code == 200){
//                            swal({
//                                text: "Your plan is upgraded",
//                                type:"success",
//                                showConfirmButton: false,
//                                timer: 1500
//                            });
//                            location.reload();
//                        }else if(response.code == 400){
//                            swal({
//                                text: response.message,
//                                type:"warning",
//                                showConfirmButton: true,
//                                timer: 1500
//                            });
//
//                        }
//
//
//        //                        if(response.code == 200)
//        //                        {
//        //                            document.location.href = response.navigate;
//        //                        }else if(response.code==401){
//        //                            alert(response.message);
//        //                        }else {
//        //                            alert(response.message);
//        //                        }
//                    },
//                    error:function(error){
//                    }
//                })

    });


    $(document).on('click','.payment',function(){
        planMode = this.id;
        paymentUpgrade();


    });

    function paymentUpgrade(){
        $.ajax({
            url:'updatePlan',
            type:'POST',
            data:{
                "currentPlan":currentPlan,
                "newPlan":newPlan,
                "paymentMode":planMode
            },
            success:function(response){

                /*
                 * 200 success 202 success => redirect url
                 * 401 not valid plan
                 * 500 exception
                 * 400 something wrong */
                if(response.code === 202){
                    document.location.href = response.redirectUrl;
                }else if(response.code == 200){
                    swal({
                        text: "Your plan changed",
                        type:"success",
                        showConfirmButton: false,
                        timer: 1500
                    });
                    location.reload();
                }else if(response.code == 400){
                    swal({
                        text: response.message,
                        type:"warning",
                        showConfirmButton: true,
                        timer: 1500
                    });

                }


                //                        if(response.code == 200)
                //                        {
                //                            document.location.href = response.navigate;
                //                        }else if(response.code==401){
                //                            alert(response.message);
                //                        }else {
                //                            alert(response.message);
                //                        }
            },
            error:function(error){
                console.log(error)
            }
        })
    }
</script>