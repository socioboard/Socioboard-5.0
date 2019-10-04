<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="">
    <meta name="author" content="">
    <link rel="icon" href="/img/favicons/favicon.ico">
    <title>{{ $status }}</title>

    <!-- Bootstrap core CSS -->
    <link rel="stylesheet" type="text/css" href="/assets/plugins/bootstrap/css/bootstrap.min.css">
    <style>
        textarea {
            width: 80%;
            height: 200px;
            font-size: 10pt !important;
        }
    </style>

</head>

<body class="text-center">

<div class="cover-container d-flex h-100 p-3 mx-auto flex-column">
    <header class="masthead mb-auto">
        <div class="inner">
        </div>
    </header>

    <main role="main" class="inner cover">
        <h1 class="cover-heading">{{ $status }}!</h1>

        <h3>code {{ $code}}</h3>
        <p class="lead">{{ $descr }}</p>
        <p class="lead">{!!  $message!!}</p>
        <p class="lead">
            <a href="{{ $action_link }}" class="btn btn-lg btn-secondary">{{ $action_title }}</a>
        </p>
    </main>

    <footer class="mastfoot mt-auto">
        <div class="inner">
            <p></p>
        </div>
    </footer>
</div>

</body>
</html>
