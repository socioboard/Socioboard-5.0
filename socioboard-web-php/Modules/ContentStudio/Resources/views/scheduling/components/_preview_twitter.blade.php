<div class="tab-pane fade" id="twitter-preview" role="tabpanel" aria-labelledby="twitter-tab-preview">
    <!--begin::Image-->
    <div class="preview-tab">
        <div class="preview-tab-inner">
            <!--begin::Top-->
            <div class="d-flex align-items-center">
                <!--begin::Symbol-->
                <div class="symbol symbol-40 symbol-light-success mr-5">
                    <span class="symbol-label">
                        <img src="{{ asset('/media/svg/avatars/047-girl-25.svg') }}" class="h-75 align-self-end" alt=""/>
                    </span>
                </div>
                <!--end::Symbol-->

                <!--begin::Info-->
                <div class="d-flex flex-column flex-grow-2">
                    <a class="text-hover-primary mb-1 font-size-lg font-weight-bolder" id="account_name" title="Here it will be your selected account name on the selected Platform">Account Name</a>
                    <span class="text-muted font-weight-bold">Just now</span>
                </div>
                <!--end::Info-->
            </div>
            <!--end::Top-->

            <!--begin::Bottom-->
            <div class="pt-4">
                <!--begin::Text-->
                <p class="font-size-lg font-weight-normal pt-5 mb-2 postText">
                    {{$content}}
                </p>
                <!--end::Text-->
                <!--begin::Image-->
                <div class="imageShow d-flex flex-column" >
                    @include('contentstudio::scheduling.components._media_show')
                </div>
                <!--end::Image-->
                <hr>
                <!--begin::Action-->
                <div class="d-flex justify-content-around mt-2">
                    <div class="font-weight-bolder font-size-sm p-2 disabled">
                        <span class="svg-icon svg-icon-md svg-icon-dark-25">
                                <i class="far fa-comment fa-fw"></i>
                        </span>
                    </div>
                    <div class=" font-weight-bolder font-size-sm p-2 disabled">
                            <span class="svg-icon svg-icon-md svg-icon-danger">
                                    <i class="fas fa-retweet fa-fw"></i>
                            </span>
                        </div>
                    <div class=" font-weight-bolder font-size-sm p-2 disabled">
                        <span class="svg-icon svg-icon-md svg-icon-danger">
                            <i class="far fa-heart fa-fw"></i>
                        </span>
                    </div>
                    <div class="font-weight-bolder font-size-sm p-2 disabled">
                        <span class="svg-icon svg-icon-md svg-icon-dark-25">
                            <i class="fas fa-upload fa-fw"></i>
                        </span>
                    </div>
                </div>
                <!--end::Action-->
            </div>
            <!--end::Bottom-->
        </div>
    </div>
    <!--end::Image-->
</div>