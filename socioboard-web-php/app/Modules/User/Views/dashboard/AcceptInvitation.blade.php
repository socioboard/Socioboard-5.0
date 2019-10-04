@extends('User::dashboard.master')
@section('title')
    <title>SocioBoard |Invitation Requests</title>
@endsection





@section('acceptInvitation')
    <div class="row margin-top-10">
        <div class="col-md-12">
            <h4>Invitation Requests</h4>
        </div>
        <div class="col-md-12">
            @if($invite != "")
                <div class="card border-0 shadow mb-3">
                    <div class="card-body">
                        <h5 class="float-left mt-1 mb-0"><b>{{$invite->team_admin_name}}</b> Invited you to join team <b>{{$invite->team_name}}</b></h5>
                        <button class="btn btn-sm btn-primary float-right ml-1 accept" id="{{$invite->team_id}}">Accept</button>
                        <button class="btn btn-sm btn-danger float-right ml-1 decline" id="{{$invite->team_id}}">Decline</button>
                    </div>
                </div>
                @else
                <div class="card border-0 shadow mb-3">
                    <div class="card-body">
                       No invitations
                    </div>
                </div>
                @endif


        </div>
    </div>

    @endsection


@section('script')
    <script>
        //for GA
        var eventCategory = 'User';
        var eventAction = 'Accept-Invitation';

        $(document).ready(function(){
            $(document).on('click','.accept',function(){
                var team = $(this).attr('id');
                $.ajax({
                    type: "POST",
                    url: "accept-invitation",
                    data: {
                        teamid: team
                    },
                    //TODO remove user invitation column
                    success: function(response){
                        if(response.code === 200 ){
                            swal("invitation accepted");
                            setTimeout(function() {
                                location.reload();
                            }, 1000);
                        }
                    },
                    error: function (error) {
                        console.log(error)
                        swal("Not able to accept invitation");
                    }
                });
            });


            $(document).on('click','.decline',function(){
                var team = $(this).attr('id');
                $.ajax({
                    type: "POST",
                    url: "decline-invitation",
                    data: {
                        teamid: team
                    },
                    success: function(response){
                        console.log(response.code);
                        if(response.code === 200 ){
                            swal("invitation Declined");
                            setTimeout( function(){
                                location.reload();
                            },1000);
                        }
                    },
                    error: function (error) {
                        console.log(error)
                        swal("Not able to accept invitation");
                    }
                });
            });
        })
    </script>
    @endsection