<div class="card card-custom gutter-b card-stretch">
    <!--begin::Header-->
    <div class="card-header border-0 py-5">
        <h3 class="card-title font-weight-bolder">Preview</h3>
        <ul class="nav nav-light-warning nav-pills" id="preview-tabs" role="tablist">
            <li class="nav-item" role="presentation">
                <a class="nav-link active desktopClassDiv" id="desktop-preview" data-toggle="tab" href="#desktop-preview" role="tab"
                   aria-controls="desktop-preview">Desktop</a>
            </li>
            <li class="nav-item" role="presentation">
                <a class="nav-link mobileClassDiv" id="mobile-preview" data-toggle="tab" href="#mobile-preview" role="tab"
                   aria-controls="mobile-preview">Mobile</a>
            </li>

        </ul>
    </div>
    <!--end::Header-->

    <!--begin::Body-->
    <div class="card-body pt-2 position-relative overflow-hidden">
        <div>
            @if(isset($socialAccounts) && !empty($socialAccounts))
            <ul class="nav nav-light-warning nav-pills" id="social-preview-tabs" role="tablist">
                <li class="nav-item">
                    <a class="nav-link active" id="facebook-tab-preview" data-toggle="tab" href="#facebook-preview">
                        <span class="nav-text">Facebook</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" id="twitter-tab-preview" data-toggle="tab" href="#twitter-preview"
                       aria-controls="Twitter">
                        <span class="nav-text">Twitter</span>
                    </a>
                </li>
            </ul>
            @endif
            <div class="tab-content mt-5" id="PreviewTabContent">
                @include('contentstudio::scheduling.components._preview_facebook')
                @include('contentstudio::scheduling.components._preview_instagram')
                @include('contentstudio::scheduling.components._preview_twitter')
                @include('contentstudio::scheduling.components._preview_linkedin')
            </div>
        </div>
    </div>
</div>