@extends('home::layouts.UserLayout')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | Post details</title>
@endsection
@section('links')

@endsection
@section('content')
    <!--begin::Content-->
    <div class="content  d-flex flex-column flex-column-fluid" id="Sb_content">

        <!--begin::Entry-->
        <div class="d-flex flex-column-fluid">
            <!--begin::Container-->
            <div class=" container-fluid ">
                <!--begin::HIstory-->
                <div class="card card-custom card-stretch gutter-b">
                    <!--begin::Header-->
                    <div class="card-header border-0 py-5">
                        <h3 class="card-title align-items-start flex-column">
                            <span class="card-label font-weight-bolder">Post Details</span>
                        </h3>
                    </div>
                    <!--end::Header-->

                    <!--begin::Body-->
                    <div class="card-body pt-0 pb-3">
                        <!--begin::Table-->
                        <div class="table-responsive">
                            <table class="table table-head-custom table-head-bg table-borderless table-vertical-center">
                                <thead>
                                <tr class="text-uppercase">
                                    <th style="min-width: 200px">Social account</th>
                                    <th style="min-width: 200px">Description</th>
                                    <th style="min-width: 200px">Post Date</th>
                                    <th style="min-width: 250px">Status</th>
                                    <th style="min-width: 300px">Post Link</th>
                                </tr>
                                </thead>
                                <tbody>
                                @if($data['code'] === 200 && sizeof($data['data'])> 0 )
                                    @foreach($data['data'] as $tasks)
                                        <tr>
                                            <td class="pl-0 py-8">
                                                @if(sizeof($accounts) > 0)
                                                    @foreach($accounts as $social)
                                                            @if((int)$social->account_id === $tasks->accountId)
                                                                <div class="d-flex">
                                                                <img src="{{$social->profile_pic_url}}" onerror=" this.onerror=null;this.src='/media/svg/avatars/001-boy.svg';"
                                                                     class="img-fluid media-profile-pic" style="height: 50px">
                                                                <div class="media-body text-left ml-5">
                                                                        <h5 class="mt-0">{{$social->first_name}}</h5>
                                                                        @if($social->account_type === 1 || $social->account_type === 3)
                                                                            <p class="mb-1">Facebook</p>
                                                                        @elseif($social->account_type === 2 )
                                                                            <p class="mb-1">Facebook page</p>
                                                                        @elseif($social->account_type === 4 )
                                                                            <p class="mb-1">Twitter</p>
                                                                        @elseif($social->account_type === 5 )
                                                                            <p class="mb-1">Instagram</p>
                                                                        @elseif($social->account_type === 6 )
                                                                            <p class="mb-1">LinkedIn</p>
                                                                        @elseif($social->account_type === 7 )
                                                                            <p class="mb-1">LinkedIn page</p>
                                                                            ` @elseif($social->account_type === 9 )
                                                                            <p class="mb-1">Youtube</p>
                                                                        @elseif($social->account_type === 8 || $social->account_type === 10 )
                                                                            <p class="mb-1">Google</p>
                                                                        @elseif( $social->account_type === 12 )
                                                                            <p class="mb-1">Instagram Business</p>
                                                                        @elseif( $social->account_type === 16 )
                                                                            <p class="mb-1">Tumblr</p>
                                                                        @elseif( $social->account_type === 11 )
                                                                            <p class="mb-1">Pinterest</p>
                                                                        @endif
                                                                </div>
                                                                </div>
                                                        @endif
                                                    @endforeach
                                                @endif
                                            </td>
                                            <td>
                                                            <span class="font-weight-bold d-block font-size-lg">
                                                                {{$tasks->publishedContentDetails}}
                                                            </span>
                                            </td>

                                            <td>
                                                @if($tasks->PublishedStatus === "Success")
                                                <?php
                                                $timezone = session()->get('timezone');
                                                $dateTIme = $tasks->publishedDate;
                                                $date = new DateTime($dateTIme);
                                                $date->setTimezone(new DateTimeZone($timezone));
                                                ?>
                                                <p class="font-weight-bold">{{$date->format('Y-m-d H:i:s')}}</p>
                                                    @else
                                                    {{'-'}}
                                                    @endif
                                            </td>
                                            <td>
                                                @if($tasks->PublishedStatus === "Success")
                                                    {{"Success"}}
                                                @else
                                                    {{'Failed'}}
                                                @endif
                                            </td>
                                                <td>
                                                    @if($tasks->PublishedStatus === "Success")
                                                        <a href="{{$tasks->PublishedUrl}}" class="font-weight-bold font-size-lg" target="_blank">{{$tasks->PublishedUrl}}</a>
                                                    @else
                                                        {{'-'}}
                                                    @endif
                                                </td>
                                        </tr>
                                    @endforeach
                                @endif
                                </tbody>
                            </table>
                        </div>
                        <!--end::Table-->
                    </div>
                    <!--end::Body-->
                </div>
                <!--end::HIstory-->
            </div>
            <!--end::Container-->
        </div>
        <!--end::Entry-->
    </div>
    <!--end::Content-->
@endsection
@section('scripts')
    <script>
        function processRequest(id, type) {
            alert(id)
            $.ajax({
                url: "/approve-request",
                data: {id, type},
                type: 'POST',
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function (response) {
                    $("#deleteImageModal").modal("hide");
                    if (response.code === 200){
                        toastr.success(response.data);
                        window.location.reload();
                    }else{
                        toastr.alert(response.message);
                    }
                },
                error: function (error) {
                    toastr.alert(error.message);
                }
            })
        }
    </script>
@endsection
