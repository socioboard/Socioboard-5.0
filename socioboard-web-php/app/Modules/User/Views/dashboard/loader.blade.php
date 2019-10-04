<html>
<head>
    <link rel="stylesheet" type="text/css" href="../assets/plugins/bootstrap/css/bootstrap.min.css">
</head>
<body>
<style>
    #loader4 {
        height: 100px;
        width: 260px;
        margin: 70px auto 0;
        position: relative
    }

    #loader4 .loader {
        background: #ccc;
        width: 40px;
        height: 40px;
        border-radius: 24px;
        display: inline-block;
        position: absolute
    }

    #loader4 .loader-1 {
        animation: animateDot1 1.5s linear infinite;
        left: 130px;
        background: #f73138
    }

    #loader4 .loader-2 {
        background: #00b733;
        left: 60px;
        animation: animateDot2 1.5s linear infinite;
        animation-delay: .5s
    }

    #loader4 .loader-3 {
        background: #448afc;
        left: 130px;
        animation: animateDot3 1.5s linear infinite
    }

    #loader4 .loader-4 {
        background: #950faf;
        left: 60px;
        animation: animateDot4 1.5s linear infinite;
        animation-delay: .5s
    }

    @keyframes animateDot1 {
        0% {
            transform: rotate(0) translateX(-60px)
        }
        25%, 75% {
            transform: rotate(180deg) translateX(-60px)
        }
        100% {
            transform: rotate(360deg) translateX(-60px)
        }
    }

    @keyframes animateDot2 {
        0% {
            transform: rotate(0) translateX(-70px)
        }
        25%, 75% {
            transform: rotate(-180deg) translateX(-70px)
        }
        100% {
            transform: rotate(-360deg) translateX(-70px)
        }
    }

    @keyframes animateDot3 {
        0% {
            transform: rotate(0) translateX(60px)
        }
        25%, 75% {
            transform: rotate(180deg) translateX(60px)
        }
        100% {
            transform: rotate(360deg) translateX(60px)
        }
    }

    @keyframes animateDot4 {
        0% {
            transform: rotate(0) translateX(60px)
        }
        25%, 75% {
            transform: rotate(-180deg) translateX(60px)
        }
        100% {
            transform: rotate(-360deg) translateX(60px)
        }
    }
</style>

{{--@endsection--}}
<div class="container">
    <br/><br/>
    <h3 class="h3">Please wait.. Do not refresh the page</h3>
    <div class="row">
        <div class="col-md-12">
            <div id="loader4">
                <span class="loader loader-1"></span>
                <span class="loader loader-2"></span>
                <span class="loader loader-3"></span>
                <span class="loader loader-4"></span>
            </div>
        </div>
    </div>
    <br/><br/>
</div>
</body>
<script type="text/javascript" src="../assets/js/jquery-3.3.1.min.js"></script>
<script type="text/javascript" src="../assets/plugins/bootstrap/js/bootstrap.min.js"></script>

<script>
    paymentsAjax();
    setInterval(function(){ paymentsAjax() }, 10000);

    function paymentsAjax(){
        $.ajax({
            url:'payment-ajax',
            type:'GET',

            success:function(response){
               if(response.code == 200){
                   location.href = "dashboard/"+response.team;
               }
                else{
                   console.log("wait")
               }
            },
            error:function(error){
                console.log(error)
            }
        })

    }
</script>
</html>

