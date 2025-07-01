@extends('layouts.app')

@section('title', 'WhatsApp QR Code')

@section('content_header')
    <h1>WhatsApp QR Code</h1>
@stop

@section('content')
    <div class="card">
        <div class="card-body text-center">
            <div id="qrcode-container">
                <p>Loading QR Code...</p>
            </div>
        </div>
    </div>
@stop

@section('js')
    <script>
        $(document).ready(function() {
            function fetchQrCode() {
                $.ajax({
                    url: '{{ route('whatsapp.get_qrcode') }}',
                    method: 'GET',
                    success: function(response) {
                        if (response.qrcode) {
                            $('#qrcode-container').html('<img src="' + response.qrcode + '" alt="WhatsApp QR Code">');
                        } else {
                            $('#qrcode-container').html('<p>Failed to load QR Code. Please try again.</p>');
                        }
                    },
                    error: function() {
                        $('#qrcode-container').html('<p>Error connecting to the API. Is the service running?</p>');
                    }
                });
            }

            fetchQrCode();
            setInterval(fetchQrCode, 10000); // Refresh every 10 seconds
        });
    </script>
@stop
