@extends('User::master')
@section('title')
    <title>SocioBoard</title>
    @endsection

@section('index')

    <section class="header_bg">
        <div class="container">
            <div class="row">
                <div class="col-md-6 margin-top-50">
                    <div class="embed-responsive embed-responsive-16by9">
                        <iframe class="embed-responsive-item" src="https://www.youtube.com/embed/XJ8wrLmuGHs?rel=0" allowfullscreen></iframe>
                    </div>
                </div>
                <div class="col-md-6 text-center margin-top-50">
                    <h2 class="text-orange-light"><strong>Social Media Lead Generation Toolkit for Businesses</strong></h2>
                    <h6 class="text-white margin-bottom-30">Socioboard helps businesses and brands with a 360o social media lead
                        generation,
                        marketing, customer support and engagement automation platform.</h6>
                    <a href="signup.html" class="btn bg-orange-light">Get Free Demo Now</a>
                </div>
            </div>
        </div>
    </section>
    <!-- clients -->
    <section class="container-fluid" style="background: #636363;">
        <div class="text-center">
            <img src="assets/imgs/clients.jpg" class="img-fluid" alt="client_name">
        </div>
    </section>
    <!-- features -->
    <section class="container">
        <div class="row margin-top-50 margin-bottom-50">
            <div class="col-md-12 text-center margin-bottom-10">
                <h3><strong>How is <span class="text-orange-light">SOCIOBOARD</span> useful to you ?</strong></h3>
            </div>
            <div class="col-md-3 text-center">
                <img src="assets/imgs/energy.png" class="img-fluid" />
                <h6 class="margin-bottom-30 margin-top-10">Highly customizable and scalable open-source tools</h6>
            </div>
            <div class="col-md-3 text-center">
                <img src="assets/imgs/energy.png" class="img-fluid" />
                <h6 class="margin-bottom-30 margin-top-10">Advanced scheduling & publishing tools</h6>
            </div>
            <div class="col-md-3 text-center">
                <img src="assets/imgs/energy.png" class="img-fluid" />
                <h6 class="margin-bottom-30 margin-top-10">Prompt feeds and interactive social discovery tools</h6>
            </div>
            <div class="col-md-3 text-center">
                <img src="assets/imgs/energy.png" class="img-fluid" />
                <h6 class="margin-bottom-30 margin-top-10">Sophisticated analytics on various parameters</h6>
            </div>
            <div class="col-md-3 text-center">
                <img src="assets/imgs/energy.png" class="img-fluid" />
                <h6 class="margin-bottom-30 margin-top-10">Social CRM tools including shared customer records</h6>
            </div>
            <div class="col-md-3 text-center">
                <img src="assets/imgs/energy.png" class="img-fluid" />
                <h6 class="margin-bottom-30 margin-top-10">Customer support features like tasks and Helpdesk integration</h6>
            </div>
            <div class="col-md-3 text-center">
                <img src="assets/imgs/energy.png" class="img-fluid" />
                <h6 class="margin-bottom-30 margin-top-10">Highly efficient team collaboration tools</h6>
            </div>
            <div class="col-md-3 text-center">
                <img src="assets/imgs/energy.png" class="img-fluid" />
                <h6 class="margin-bottom-30 margin-top-10">24/7 Technical Support</h6>
            </div>
        </div>
    </section>
    <!-- our products -->
    <section class="container">
        <div class="row margin-top-50 margin-bottom-50">
            <div class="col-md-12 text-center margin-bottom-10">
                <h3><strong>Our Products</strong></h3>
            </div>
            <div class="col-md-4 text-center">
                <img src="assets/imgs/Socioboard_logo.png" class="img-fluid" />
                <h6 class="margin-bottom-30 margin-top-10">Socioboard core</h6>
            </div>
            <div class="col-md-2 text-center">
                <h6 class="margin-bottom-30 margin-top-10">SocioLeads</h6>
            </div>
            <div class="col-md-2 text-center">
                <h6 class="margin-bottom-30 margin-top-10">BoardMe</h6>
            </div>
            <div class="col-md-2 text-center">
                <h6 class="margin-bottom-30 margin-top-10">BrandBuzzpro</h6>
            </div>
            <div class="col-md-2 text-center">
                <h6 class="margin-bottom-30 margin-top-10">BrandHit</h6>
            </div>
        </div>
    </section>
    <!-- testimonial -->
    <section>
        <div id="carouselExampleIndicators" class="carousel slide" data-ride="carousel">
            <ol class="carousel-indicators">
                <li data-target="#carouselExampleIndicators" data-slide-to="0" class="active"></li>
                <li data-target="#carouselExampleIndicators" data-slide-to="1"></li>
            </ol>
            <div class="carousel-inner">
                <div class="carousel-item active">
                    <img class="d-block w-100" src="assets/imgs/1920x480.png" alt="First slide">
                </div>
                <div class="carousel-item">
                    <img class="d-block w-100" src="assets/imgs/1920x480.png" alt="Second slide">
                </div>
            </div>
            <a class="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="sr-only">Previous</span>
            </a>
            <a class="carousel-control-next" href="#carouselExampleIndicators" role="button" data-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="sr-only">Next</span>
            </a>
        </div>
    </section>



    @endsection
