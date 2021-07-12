@extends('layouts.app')

@section('content')
    <div>
        <h2 class="text-center">Welcome to Admin Dashboard, You are logged in!</h2>
        <h2>{{ $user->name }}</h2>
    </div>
@endsection
