@extends('home::layouts.UserLayout')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | MostShared</title>
@endsection
@section('discoveryActive')
    active
@endsection
@section('content')
    <div class="content  d-flex flex-column flex-column-fluid" id="Sb_content">
        <!--begin::Entry-->
        <div class="d-flex flex-column-fluid">
            <!--begin::Container-->
            <div class=" container-fluid ">
                <!--begin::Profile-->
                <!--begin::Row-->
                <div class="row">
                    <div class="col-xl-4">
                        <div class="card card-custom gutter-b">
                            <!--begin::Body-->
                            <div class="card-body">
                                <!--begin::Form-->
                                <form>
                                    <!--begin::Social-->
                                    <div class="form-group mb-7">
                                        <label class="font-size-h3 font-weight-bolder mb-7">Social Platforms</label>
                                        <!--begin::Radio list-->
                                        <div class="radio-list">
                                            <label class="radio radio-lg mb-7">
                                                <input type="radio" name="social" checked="">
                                                <span></span>
                                                <div class="font-size-lg font-weight-bold">All</div>
                                                <div class="ml-auto font-weight-bold">2047</div>
                                            </label>
                                            <label class="radio radio-lg mb-7">
                                                <input type="radio" name="social">
                                                <span></span>
                                                <div class="font-size-lg font-weight-bold">Facebook</div>
                                                <div class="ml-auto font-weight-bold">143</div>
                                            </label>
                                            <label class="radio radio-lg mb-7">
                                                <input type="radio" name="social">
                                                <span></span>
                                                <div class="font-size-lg font-weight-bold">Twitter</div>
                                                <div class="ml-auto font-weight-bold">50</div>
                                            </label>
                                            <label class="radio radio-lg mb-7">
                                                <input type="radio" name="social">
                                                <span></span>
                                                <div class="font-size-lg font-weight-bold">Instagram</div>
                                                <div class="ml-auto font-weight-bold">38</div>
                                            </label>
                                            <label class="radio radio-lg mb-7">
                                                <input type="radio" name="social">
                                                <span></span>
                                                <div class="font-size-lg font-weight-bold">YouTube</div>
                                                <div class="ml-auto font-weight-bold">90</div>
                                            </label>
                                        </div>
                                        <!--end::Radio list-->
                                    </div>
                                    <!--end::Social-->
                                    <button type="submit" class="btn font-weight-bolder mr-2 px-8">Clear</button>
                                    <button type="reset" class="btn font-weight-bolder px-8">Search</button>
                                </form>
                                <!--end::Form-->
                            </div>
                            <!--end::Body-->
                        </div>

                    </div>
                    <div class="col-xl-8">
                        <!--begin::Feeds-->
                        <div class="card card-custom gutter-b">
                            <!--begin::Header-->
                            <div class="card-header border-0 py-5">
                                <h3 class="card-title font-weight-bolder">Most Shared</h3>
                            </div>
                            <!--end::Header-->
                            <!--begin::Body-->
                            <div class="card-body">
                                <!--begin::Text-->
                                <div class="mb-5">
                                    <!--begin::Container-->
                                    <div>
                                        <!--begin::Header-->
                                        <div class="d-flex align-items-center pb-4">
                                            <!--begin::Symbol-->
                                            <div class="symbol symbol-40 symbol-light-success mr-5">
                                                            <span class="symbol-label">
                                                                <img src="{{asset('assets/media/svg/avatars/018-girl-9.svg')}}" class="h-75 align-self-end" alt="">
                                                            </span>
                                            </div>
                                            <!--end::Symbol-->

                                            <!--begin::Info-->
                                            <div class="d-flex flex-column flex-grow-1">
                                                <a href="#" class="text-hover-primary mb-1 font-size-lg font-weight-bolder">Chanchal</a>
                                                <span class="font-weight-bold">Yestarday at 5:06 PM</span>
                                            </div>
                                            <!--end::Info-->
                                        </div>
                                        <!--end::Header-->

                                        <!--begin::Body-->
                                        <div>
                                            <!--begin::Text-->
                                            <p class="font-size-lg font-weight-normal">
                                                Outlines keep you honest. They stop you from indulging in
                                                poorly thought-out metaphors about driving and keep you
                                                focused on the overall structure of your post
                                            </p>
                                            <!--end::Text-->

                                            <!--begin::Action-->
                                            <div class="d-flex align-items-center">
                                                <a href="#" class="btn btn-hover-text-primary btn-hover-icon-primary btn-sm bg-light-primary rounded font-weight-bolder font-size-sm p-2 mr-2 fb_cmt_btn">
                                                                <span class="svg-icon svg-icon-md svg-icon-primary pr-2">
                                                                        <i class="fas fa-comments"></i>
                                                                </span>24
                                                </a>

                                                <a href="#" class="btn btn-hover-text-danger btn-hover-icon-danger btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 mr-2 ">
                                                                <span class="svg-icon svg-icon-md svg-icon-dark-25 pr-2">
                                                                        <i class="fas fa-heart"></i>
                                                                </span>75
                                                </a>

                                                <a href="#" data-toggle="modal" data-target="#resocioModal" class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2">
                                                                <span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">
                                                                        <i class="fas fa-retweet"></i>
                                                                </span>re-socio
                                                </a>
                                            </div>
                                            <!--end::Action-->

                                        </div>
                                        <!--end::Body-->
                                    </div>
                                    <!--end::Container-->
                                    <!--begin::Comments toggle-->
                                    <div class="fb_cmt_div" style="display: none;">

                                        <!--begin::Item-->
                                        <div class="d-flex py-5">
                                            <!--begin::Symbol-->
                                            <div class="symbol symbol-40 symbol-light-success mr-5 mt-1">
                                                            <span class="symbol-label">
                                                                <img src="{{asset('assets/media/svg/avatars/009-boy-4.svg')}}" class="h-75 align-self-end" alt="">
                                                            </span>
                                            </div>
                                            <!--end::Symbol-->

                                            <!--begin::Info-->
                                            <div class="d-flex flex-column flex-row-fluid">
                                                <!--begin::Info-->
                                                <div class="d-flex align-items-center flex-wrap">
                                                    <a href="#" class="text-hover-primary mb-1 font-size-lg font-weight-bolder pr-6">Mr. Anderson</a>
                                                    <span class="text-muted font-weight-normal flex-grow-1 font-size-sm">1 Day ago</span>
                                                </div>

                                                <span class="font-size-sm font-weight-normal pt-1">
                                                                Long before you sit dow to put digital pen to
                                                                paper you need to make sure you have to sit down and write.
                                                            </span>
                                                <!--end::Info-->
                                            </div>
                                            <!--end::Info-->
                                        </div>
                                        <!--end::Item-->

                                        <!--begin::Item-->
                                        <div class="d-flex">
                                            <!--begin::Symbol-->
                                            <div class="symbol symbol-40 symbol-light-success mr-5 mt-1">
                                                            <span class="symbol-label">
                                                                <img src="{{asset('assets/media/svg/avatars/003-girl-1.svg')}}" class="h-75 align-self-end" alt="">
                                                            </span>
                                            </div>
                                            <!--end::Symbol-->

                                            <!--begin::Info-->
                                            <div class="d-flex flex-column flex-row-fluid">
                                                <!--begin::Info-->
                                                <div class="d-flex align-items-center flex-wrap">
                                                    <a href="#" class="text-hover-primary mb-1 font-size-lg font-weight-bolder pr-6">Mrs. Anderson</a>
                                                    <span class="text-muted font-weight-normal flex-grow-1 font-size-sm">2 Days ago</span>
                                                </div>

                                                <span class="font-size-sm font-weight-normal pt-1">
                                                                Long before you sit down to put digital pen to paper
                                                            </span>
                                                <!--end::Info-->
                                            </div>
                                            <!--end::Info-->
                                        </div>
                                        <!--end::Item-->

                                        <!--begin::Separator-->
                                        <div class="separator separator-solid mt-5 mb-4"></div>
                                        <!--end::Separator-->

                                        <!--begin::Editor-->
                                        <form class="position-relative">
                                            <label for="reply"></label>
                                            <textarea id="reply" class="form-control border-0 pr-10 resize-none" rows="1" placeholder="Reply..."></textarea>

                                            <div class="position-absolute top-0 right-0 mt-1 mr-n2">
                                                            <span class="btn btn-icon btn-sm btn-hover-icon-primary">
                                                                    <i class="fas fa-paper-plane"></i>
                                                            </span>
                                            </div>
                                        </form>
                                        <!--edit::Editor-->
                                    </div>
                                    <!--end::Comments toggle-->
                                </div>
                                <!--end::Text-->
                                <hr>
                                <!--begin::Image-->
                                <div class="mb-5">
                                    <!--begin::Top-->
                                    <div class="d-flex align-items-center">
                                        <!--begin::Symbol-->
                                        <div class="symbol symbol-40 symbol-light-success mr-5">
                                                        <span class="symbol-label">
                                                            <img src="{{asset('assets/media/svg/avatars/047-girl-25.svg')}}" class="h-75 align-self-end" alt="">
                                                        </span>
                                        </div>
                                        <!--end::Symbol-->

                                        <!--begin::Info-->
                                        <div class="d-flex flex-column flex-grow-1">
                                            <a href="#" class="text-hover-primary mb-1 font-size-lg font-weight-bolder">Chanchal</a>
                                            <span class="text-muted font-weight-bold">Yestarday at 5:06 PM</span>
                                        </div>
                                        <!--end::Info-->
                                    </div>
                                    <!--end::Top-->

                                    <!--begin::Bottom-->
                                    <div class="pt-4">
                                        <!--begin::Image-->
                                        <div class="">
                                            <img src="{{asset('assets/media/svg/illustrations/login-visual-2.svg')}}" alt="" class="img-fluid">
                                        </div>
                                        <!--end::Image-->

                                        <!--begin::Text-->
                                        <p class="font-size-lg font-weight-normal pt-5 mb-2">
                                            Outlines keep you honest. They stop you from indulging in
                                            poorly thought-out metaphors about driving and keep you
                                            focused on the overall structure of your post
                                        </p>
                                        <!--end::Text-->

                                        <!--begin::Action-->
                                        <div class="d-flex align-items-center">
                                            <a href="#" class="btn btn-hover-text-primary btn-hover-icon-primary btn-sm bg-hover-light-primary rounded font-weight-bolder font-size-sm p-2 mr-2 fb_cmt_btn">
                                                            <span class="svg-icon svg-icon-md svg-icon-dark-25 pr-2">
                                                                <i class="fas fa-comments"></i>
                                                            </span> 24
                                            </a>

                                            <a href="#" class="btn btn-icon-danger btn-sm  bg-hover-light-danger btn-hover-text-danger rounded font-weight-bolder font-size-sm p-2 mr-2">
                                                            <span class="svg-icon svg-icon-md svg-icon-danger pr-1">
                                                                    <i class="fas fa-heart"></i>
                                                            </span> 75
                                            </a>

                                            <a href="#" data-toggle="modal" data-target="#resocioModal" class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2">
                                                            <span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">
                                                                    <i class="fas fa-retweet"></i>
                                                            </span>re-socio
                                            </a>
                                        </div>
                                        <!--end::Action-->
                                    </div>
                                    <!--end::Bottom-->


                                    <!--begin::Comments toggle-->
                                    <div class="fb_cmt_div" style="display: none;">

                                        <!--begin::Item-->
                                        <div class="d-flex py-5">
                                            <!--begin::Symbol-->
                                            <div class="symbol symbol-40 symbol-light-success mr-5 mt-1">
                                                                <span class="symbol-label">
                                                                    <img src="{{asset('assets/media/svg/avatars/009-boy-4.svg')}}" class="h-75 align-self-end" alt="">
                                                                </span>
                                            </div>
                                            <!--end::Symbol-->

                                            <!--begin::Info-->
                                            <div class="d-flex flex-column flex-row-fluid">
                                                <!--begin::Info-->
                                                <div class="d-flex align-items-center flex-wrap">
                                                    <a href="#" class="text-hover-primary mb-1 font-size-lg font-weight-bolder pr-6">Mr. Anderson</a>
                                                    <span class="text-muted font-weight-normal flex-grow-1 font-size-sm">1 Day ago</span>
                                                </div>

                                                <span class="font-size-sm font-weight-normal pt-1">
                                                                    Long before you sit dow to put digital pen to
                                                                    paper you need to make sure you have to sit down and write.
                                                                </span>
                                                <!--end::Info-->
                                            </div>
                                            <!--end::Info-->
                                        </div>
                                        <!--end::Item-->

                                        <!--begin::Item-->
                                        <div class="d-flex">
                                            <!--begin::Symbol-->
                                            <div class="symbol symbol-40 symbol-light-success mr-5 mt-1">
                                                                <span class="symbol-label">
                                                                    <img src="{{asset('assets/media/svg/avatars/003-girl-1.svg')}}" class="h-75 align-self-end" alt="">
                                                                </span>
                                            </div>
                                            <!--end::Symbol-->

                                            <!--begin::Info-->
                                            <div class="d-flex flex-column flex-row-fluid">
                                                <!--begin::Info-->
                                                <div class="d-flex align-items-center flex-wrap">
                                                    <a href="#" class="text-hover-primary mb-1 font-size-lg font-weight-bolder pr-6">Mrs. Anderson</a>
                                                    <span class="text-muted font-weight-normal flex-grow-1 font-size-sm">2 Days ago</span>
                                                </div>

                                                <span class="font-size-sm font-weight-normal pt-1">
                                                                    Long before you sit down to put digital pen to paper
                                                                </span>
                                                <!--end::Info-->
                                            </div>
                                            <!--end::Info-->
                                        </div>
                                        <!--end::Item-->

                                        <!--begin::Separator-->
                                        <div class="separator separator-solid mt-5 mb-4"></div>
                                        <!--end::Separator-->

                                        <!--begin::Editor-->
                                        <form class="position-relative">
                                            <label for="reply2" style="display: none"></label>
                                            <textarea id="reply2" class="form-control border-0 pr-10 resize-none" rows="1" placeholder="Reply..."></textarea>

                                            <div class="position-absolute top-0 right-0 mt-1 mr-n2">
                                                                <span class="btn btn-icon btn-sm btn-hover-icon-primary">
                                                                        <i class="fas fa-paper-plane"></i>
                                                                </span>
                                            </div>
                                        </form>
                                        <!--edit::Editor-->
                                    </div>
                                    <!--end::Comments toggle-->
                                </div>
                                <!--end::Image-->
                                <hr>
                                <!--begin::Video-->
                                <div class="mb-5">
                                    <!--begin::Top-->
                                    <div class="d-flex align-items-center">
                                        <!--begin::Symbol-->
                                        <div class="symbol symbol-40 symbol-light-success mr-5">
                                                        <span class="symbol-label">
                                                            <img src="{{asset('assets/media/svg/avatars/047-girl-25.svg')}}" class="h-75 align-self-end" alt="">
                                                        </span>
                                        </div>
                                        <!--end::Symbol-->

                                        <!--begin::Info-->
                                        <div class="d-flex flex-column flex-grow-1">
                                            <a href="#" class="text-hover-primary mb-1 font-size-lg font-weight-bolder">Chanchal</a>
                                            <span class="text-muted font-weight-bold">Yestarday at 5:06 PM</span>
                                        </div>
                                        <!--end::Info-->
                                    </div>
                                    <!--end::Top-->

                                    <!--begin::Bottom-->
                                    <div class="pt-4">

                                        <!--begin::Video-->
                                        <div class="embed-responsive embed-responsive-16by9">
                                            <iframe class="embed-responsive-item rounded" src="https://www.youtube.com/embed/OKkJ2OQyJYk" allowfullscreen=""></iframe>
                                        </div>
                                        <!--end::Video-->

                                        <!--begin::Text-->
                                        <p class="font-size-lg font-weight-normal pt-5 mb-2">
                                            Outlines keep you honest. They stop you from indulging in
                                            poorly thought-out metaphors about driving and keep you
                                            focused on the overall structure of your post
                                        </p>
                                        <!--end::Text-->

                                        <!--begin::Action-->
                                        <div class="d-flex align-items-center">
                                            <a href="#" class="btn btn-hover-text-primary btn-hover-icon-primary btn-sm bg-hover-light-primary rounded font-weight-bolder font-size-sm p-2 mr-2 fb_cmt_btn">
                                                            <span class="svg-icon svg-icon-md svg-icon-dark-25 pr-2">
                                                                <i class="fas fa-comments"></i>
                                                            </span> 24
                                            </a>

                                            <a href="#" class="btn btn-icon-danger btn-sm  bg-hover-light-danger btn-hover-text-danger rounded font-weight-bolder font-size-sm p-2 mr-2">
                                                            <span class="svg-icon svg-icon-md svg-icon-danger pr-1">
                                                                    <i class="fas fa-heart"></i>
                                                            </span> 75
                                            </a>

                                            <a href="#" data-toggle="modal" data-target="#resocioModal" class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2">
                                                            <span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">
                                                                    <i class="fas fa-retweet"></i>
                                                            </span>re-socio
                                            </a>
                                        </div>
                                        <!--end::Action-->
                                    </div>
                                    <!--end::Bottom-->

                                    <!--begin::Comments toggle-->
                                    <div class="fb_cmt_div" style="display: none;">

                                        <!--begin::Item-->
                                        <div class="d-flex py-5">
                                            <!--begin::Symbol-->
                                            <div class="symbol symbol-40 symbol-light-success mr-5 mt-1">
                                                                <span class="symbol-label">
                                                                    <img src="{{asset('assets/media/svg/avatars/009-boy-4.svg')}}" class="h-75 align-self-end" alt="">
                                                                </span>
                                            </div>
                                            <!--end::Symbol-->

                                            <!--begin::Info-->
                                            <div class="d-flex flex-column flex-row-fluid">
                                                <!--begin::Info-->
                                                <div class="d-flex align-items-center flex-wrap">
                                                    <a href="#" class="text-hover-primary mb-1 font-size-lg font-weight-bolder pr-6">Mr. Anderson</a>
                                                    <span class="text-muted font-weight-normal flex-grow-1 font-size-sm">1 Day ago</span>
                                                </div>

                                                <span class="font-size-sm font-weight-normal pt-1">
                                                                    Long before you sit dow to put digital pen to
                                                                    paper you need to make sure you have to sit down and write.
                                                                </span>
                                                <!--end::Info-->
                                            </div>
                                            <!--end::Info-->
                                        </div>
                                        <!--end::Item-->

                                        <!--begin::Item-->
                                        <div class="d-flex">
                                            <!--begin::Symbol-->
                                            <div class="symbol symbol-40 symbol-light-success mr-5 mt-1">
                                                                <span class="symbol-label">
                                                                    <img src="{{asset('assets/media/svg/avatars/003-girl-1.svg')}}" class="h-75 align-self-end" alt="">
                                                                </span>
                                            </div>
                                            <!--end::Symbol-->

                                            <!--begin::Info-->
                                            <div class="d-flex flex-column flex-row-fluid">
                                                <!--begin::Info-->
                                                <div class="d-flex align-items-center flex-wrap">
                                                    <a href="#" class="text-hover-primary mb-1 font-size-lg font-weight-bolder pr-6">Mrs. Anderson</a>
                                                    <span class="text-muted font-weight-normal flex-grow-1 font-size-sm">2 Days ago</span>
                                                </div>

                                                <span class="font-size-sm font-weight-normal pt-1">
                                                                    Long before you sit down to put digital pen to paper
                                                                </span>
                                                <!--end::Info-->
                                            </div>
                                            <!--end::Info-->
                                        </div>
                                        <!--end::Item-->

                                        <!--begin::Separator-->
                                        <div class="separator separator-solid mt-5 mb-4"></div>
                                        <!--end::Separator-->

                                        <!--begin::Editor-->
                                        <form class="position-relative">
                                            <label for="reply3" style="display: none"></label>
                                            <textarea id="reply3" class="form-control border-0 pr-10 resize-none" rows="1" placeholder="Reply..."></textarea>

                                            <div class="position-absolute top-0 right-0 mt-1 mr-n2">
                                                                <span class="btn btn-icon btn-sm btn-hover-icon-primary">
                                                                        <i class="fas fa-paper-plane"></i>
                                                                </span>
                                            </div>
                                        </form>
                                        <!--edit::Editor-->
                                    </div>
                                    <!--end::Comments toggle-->
                                </div>
                                <!--end::Video-->
                            </div>
                            <!--end::Body-->
                        </div>
                        <!--end::Feeds-->
                    </div>

                </div>
                <!--end::Row-->
                <!--end::Profile-->
            </div>
            <!--end::Container-->
        </div>
        <!--end::Entry-->
    </div>
@endsection
@section('scripts')
    <script>
        $('#mostShared').css('background','#e4e4e4').find('span').css('color','#3699FF');
    </script>
@endsection

