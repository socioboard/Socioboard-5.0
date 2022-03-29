@extends('home::layouts.UserLayout')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | Scheduling</title>
@endsection
@section('links')
    <link rel="stylesheet" type="text/css" href="{{asset('plugins/custom/emojionearea/css/emojionearea.min.css') }}"/>
    <!--begin::Page Vendors Styles(used by this page)-->
    <link href="{{asset('plugins/custom/fullcalendar/fullcalendar.bundle.css') }}" rel="stylesheet" type="text/css"/>
    <!--end::Page Vendors Styles-->
    <link rel="stylesheet" type="text/css" href="{{asset('plugins/custom/dropify/dist/css/dropify.min.css') }}"/>
    <link rel="stylesheet" type="text/css" href="{{asset('plugins/custom/emojionearea/css/emojionearea.min.css') }}">

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
                            <span class="card-label font-weight-bolder ">YouTube Drafts</span>
                        </h3>
                        <div class="card-toolbar socioqueue-post">
                            <a href="/home/publishing/youtube-scheduling" class="btn btn-success font-weight-bolder font-size-sm">Create schedule post</a>
                        </div>
                    </div>
                    <!--end::Header-->

                    <!--begin::Body-->
                    <div class="card-body pt-0 pb-3">
                        <!--begin::Table-->
                        <div class="table-responsive">
                            @if($data['code'] === 200 && sizeof($data['data']->postDetails) > 0)
                            <table class="table table-head-custom table-head-bg table-borderless table-vertical-center">
                                <thead>
                                <tr class="text-uppercase">
                                    <th style="min-width: 200px" class="pl-7"><span class="">Post</span></th>
                                    <th style="min-width: 200px">Date</th>
                                    <th style="min-width: 200px">Privacy Type</th>
                                    <th style="min-width: 130px">Status</th>
                                    <th style="min-width: 100px">Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                @foreach($data['data']->mongoPost as $item)
                                <tr>
                                    <td class="pl-0 py-8">
                                        <div class="d-flex align-items-center schedule-post">
                                            <div class="symbol symbol-50 flex-shrink-0 mr-4">
                                                <div class="symbol-label">
                                                    <video style="object-fit: contain;height: inherit; width: inherit;" autoplay muted>
                                                        <source src="{{env('API_URL').$item->mediaUrl['0']}}">
                                                        Your browser does not support the video tag.
                                                    </video>
                                                </div>
                                            </div>
                                            <div>
                                                <a href="#" class="font-weight-bolder text-hover-primary mb-1 font-size-lg">{{$item->title}}</a>
                                                <span class="font-weight-bold d-block"> -
                                                                        <i class="fab fa-youtube " data-toggle="tooltip" data-placement="top" title=""></i>

                                                                    </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="">
                                            @php
                                                $timezone = session()->get('timezone');
                                            @endphp
                                                @php
                                                    $dateTIme = $item->createdDate;
                                                    $date = new DateTime($dateTIme);
                                                    $date->setTimezone(new DateTimeZone($timezone));
                                                @endphp
                                                <span class="font-weight-bolder d-block font-size-lg">
                                                    {{$date->format('Y-m-d H:i:s')}}
                                                </span>
                                        </span>
                                    </td>
                                    <td>
                                        <span class="">
                                                                {{$item->privacy}}
                                                            </span>
                                    </td>
                                    <td>
                                        <span class="label label-lg label-light-primary label-inline">Draft</span>
                                    </td>
                                    <td class="pr-0">
                                        @foreach($data['data']->postDetails as $postData)
                                            @if($postData->mongo_id === $item->_id)
                                        <a href="/youtube-edit/{{$postData->id}}" class="btn btn-icon text-hover-info btn-sm">
                                                                <span class="svg-icon svg-icon-md svg-icon-info">
                                                                        <i class="fas fa-pen-square"></i>
                                                                </span>
                                        </a>
                                                <a href="#" class="btn btn-icon text-hover-info btn-sm ml-4" data-toggle="modal" data-target="#deletequeueModal{{$postData->id}}">
                                                                <span class="svg-icon svg-icon-md svg-icon-info">
                                                                    <i class="fas fa-trash" ></i>
                                                                </span>
                                                </a>
                                                <div class="modal fade" id="deletequeueModal{{$postData->id}}" tabindex="-1" role="dialog" aria-labelledby="deletequeueModal"
                                                     aria-hidden="true">
                                                    <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
                                                        <div class="modal-content">
                                                            <div class="modal-header">
                                                                <h5 class="modal-title" id="deleteImageModalLabel">Delete Draft</h5>
                                                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                                    <i aria-hidden="true" class="ki ki-close"></i>
                                                                </button>
                                                            </div>
                                                            <div class="modal-body">
                                                                <form id="delete_post_form" >
                                                                    @csrf
                                                                    <input type="hidden" name="id" id="delete_id" value="{{$postData->id}}" >
                                                                    <div class="text-center">
                                                                        <span class="font-weight-bolder font-size-h4 "> Are you sure wanna delete this Draft? </span>
                                                                    </div>
                                                                    <div class="d-flex justify-content-center">
                                                                        <button type="submit"
                                                                                class="btn text-danger font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"
                                                                                id="image-delete">Delete it! </button>
                                                                        <a href="javascript:;" type="button"
                                                                           class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3" data-dismiss="modal">No
                                                                            thanks. </a>
                                                                    </div>
                                                                </form>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            @endif
                                        @endforeach
                                    </td>
                                </tr>
                                @endforeach
                                </tbody>
                            </table>
                            @else
                                <div class="card-body">
                                    <div class="text-center">
                                        <div class="symbol symbol-150">
                                            <img src="/media/svg/illustrations/no-feeds.svg" class="">
                                        </div>
                                        <h6>Currently no Drafts added</h6>
                                    </div>
                                </div>
                            @endif
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
    $(document).ready(function(){
        $("#home_tab").trigger('click');
    });
    $(document).on('submit','#delete_post_form', function (e) {
        e.preventDefault();
        let id = $('#delete_id').val();
        $.ajax({
            type: "delete",
            url: '/youtube-delete/'+id,
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function (response) {
                $("#deleteImageModal").modal("hide");
                if (response.code === 200){
                    toastr.success(response.data);
                    window.location.reload();
                }else{
                    toastr.alert(response.data.message);
                }
            },
            error: function (error) {
                toastr.alert(error.message);
            }
        })
    })
</script>
@endsection
