<div class="col-md-8">
    <div class="form-group col-5 p-0">
    <select class="form-control"
            onchange="this.options[this.selectedIndex].value && (window.location = this.options[this.selectedIndex].value);">
        <option selected value={{env('APP_URL')}}/report/{{$profileData->account_id}}/{{$profileData->account_type}} >{{$profileData->first_name}}</option>

        @foreach(session()->get('currentTeam')['SocialAccount'] as $acc)
            @if($acc->account_id != $profileData->account_id && $acc->account_type == $profileData->account_type)
                <option value={{env('APP_URL')}}/report/{{$acc->account_id}}/{{$acc->account_type}}>{{$acc->first_name}}</option>
            @endif
        @endforeach

    </select>
    </div>
</div>


