@extends('User::dashboard.master')
@section('title')
    <title>SocioBoard | Create Teams</title>
@endsection
@section('createteam')

        <div class="row margin-top-10">
            <div class="col-md-12">
                <h4 class="mb-0">User And Teams </h4>
                <p>Teams are used to categorize social profiles together to help manage and report on your social
                    media efforts efficiently. Learn more about Teams </p>
            </div>
        </div>
        <div class="row">
            <div class="col-4">
                <div class="list-group" id="list-tab" role="tablist">
                    <a class="list-group-item list-group-item-action active" id="list-home-list" data-toggle="list"
                       href="#list-home" role="tab" aria-controls="home">
                        <i class="fas fa-th"></i> Team List
                    </a>
                    <a class="list-group-item list-group-item-action" id="list-profile-list" data-toggle="list"
                       href="#list-profile" role="tab" aria-controls="profile">
                        <i class="far fa-file-alt"></i> Create Team
                    </a>
                </div>
            </div>
            <div class="col-8">
                <div class="tab-content" id="nav-tabContent">
                    <div class="tab-pane fade show active" id="list-home" role="tabpanel" aria-labelledby="list-home-list">
                        <div class="row">

                            <div class="col-md-4">
                                <a class="card mb-4 border-0 shadow" href="view-team/{{session()->get('team')['teamSocialAccountDetails'][0][0]->team_id}}">
                                    <div class="card-body bg-primary text-center">
                                        <h5 class="text-white mt-2">{{session()->get('team')['teamSocialAccountDetails'][0][0]->team_name}}</h5>
                                    </div>
                                </a>
                            </div>
                            @for ($i = 1; $i < count(session()->get('team')['teamSocialAccountDetails']); $i++)

                            <div class="col-md-4">
                                    <a class="card mb-4 border-0 shadow" href="view-team/{{session()->get('team')['teamSocialAccountDetails'][$i][0]->team_id}}">
                                        <div class="card-body text-center">
                                            <h5 class="text-primary mt-2">{{session()->get('team')['teamSocialAccountDetails'][$i][0]->team_name}}</h5>
                                        </div>
                                    </a>
                            </div>
                            @endfor


                        </div>
                    </div>
                    <div class="tab-pane fade" id="list-profile" role="tabpanel" aria-labelledby="list-profile-list">
                        <div class="row justify-content-md-center">
                            <div class="col-md-7">
                                <div class="card border-0 shadow">
                                    <div class="card-body">
                                        <h5 class="text-center">Create a team</h5>
                                        <p>Teams help you organize your social profiles and team members. Name your
                                            Team and you can begin connecting social profiles and adding team
                                            members to it. Twitter or Facebook required to create a team.</p>
                                        <p style="color: green;" id="createStatus"></p>
                                        <p style="color: red;" id="error"></p>
                                        <form id="createTeam">
                                            <div class="form-group">
                                                <label for="team_name">Team Name</label>
                                                <input name="team_name" type="text" class="form-control" id="team_name" placeholder="Enter team name"
                                                       required>
                                            </div>
                                            <button type="submit" class="btn btn-primary col-12">Submit</button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>



    <!-- Plan Modal -->
    <div class="modal fade " id="planModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel"
         aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div class="modal-content ">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">SocioBoard Plan</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-3">
                            <div class="card-body text-center">
                                <h6>Free</h6>
                                <button class="btn btn-primary btn-sm">Downgrade</button>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card-body text-center">
                                <h6>Standard</h6>
                                <button class="btn btn-primary btn-sm">Upgrade</button>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card-body text-center">
                                <h6>Premium</h6>
                                <button class="btn btn-primary btn-sm">Upgrade</button>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card-body text-center">
                                <h6>Platinum</h6>
                                <button class="btn btn-primary btn-sm">Upgrade</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    @endsection


@section('script')
    <script>
        //for GA
        var eventCategory = 'Team';
        var eventAction = 'Create-Team';
        $(document).ready(function(){
            $(document).on('submit','#createTeam',function(e){

                e.preventDefault();
                var form = document.getElementById('createTeam');
                var formData = new FormData(form);
                $.ajax({
                    url: "/create-team",
                    data: formData,
                    cache: false,
                    processData: false,
                    contentType: false,
                    type: 'POST',
                    beforeSend:function(){
                        $('#error').text("");
                        $('#createStatus').text("");

                    },
                    success: function (response) {
                        /*
                         * 200 => success
                         * 204 => team name required
                         * 500 => exception
                         * 400 => Team already exists*/
                        if(response.code ==200){
                            swal(response.message);
                            setTimeout(function() {
                                location.reload();
                            }, 1500);

                        }else if(response.code == 204){
                            $('#createStatus').text(response.message);
                        }else if(response.code == 400){
                            $('#createStatus').text(response.message);
                        }else{
                            $('#error').text("Something went wrong.. Not able to create team");
                        }

                    },
                    error:function(error){
                        $('#error').text("Something went wrong.. Not able to create team");
                    }
                })
            });
        });
    </script>
    @endsection