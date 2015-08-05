$(document).ready(function() {

    toastr.options = {
      "closeButton": true,
      "debug": false,
      "newestOnTop": false,
      "progressBar": false,
      "positionClass": "toast-bottom-right",
      "preventDuplicates": false,
      "onclick": null,
      "showDuration": "300",
      "hideDuration": "1000",
      "timeOut": "5000",
      "extendedTimeOut": "1000",
      "showEasing": "swing",
      "hideEasing": "linear",
      "showMethod": "fadeIn",
      "hideMethod": "fadeOut"
    }

    var navListItems = $('ul.setup-panel li a'),
        allWells = $('.setup-content');

    allWells.hide();

    navListItems.click(function(e) {
        e.preventDefault();
        var $target = $($(this).attr('href')),
            $item = $(this).closest('li');

        if (!$item.hasClass('disabled')) {
            navListItems.closest('li').removeClass('active');
            $item.addClass('active');
            allWells.hide();
            $target.show();
        }
    });

    $('ul.setup-panel li.active a').trigger('click');

    $("[id^='activate-step']").on('click', function(e) {
        //e.preventDefault();
        console.log("default prevented");
        var x = document.forms["proposalForm"]["title"].value;
        if (x == null || x == "") {
            alert("Title must be filled out");
            return false;
        } else {
            var currentId = $(this).attr('id').split('-')[2];
            $('ul.setup-panel li:eq(' + (currentId - 1) + ')').removeClass('disabled');
            $('ul.setup-panel li a[href="#step-' + currentId + '"]').trigger('click');
            //$(this).remove();
        }
    })

    $(".sliderMetric").on('change',function(e){
        console.log("on Change")
        var total = 0;
        var i=0;
        $(".sliderMetric").each(function() {
            console.log("This value:" + $(this).val() )
        total += parseFloat($(this).val());
        i += 1;
    });
    console.log("total: "+total);
    console.log("i: "+i);
    var average = total / i
        $("#totalScore").val(average)
    })

    // $('#addItem').on('submit', function(e){
    //     console.log("Add Item proposals.js
 //Called");
    //     $('#addItem').submit();
    //     console.log("submitted");
        
    // });

    $('#createProposal').on('submit', function(e){

        $('#createProposal').submit()


    });


    $('#updateProposal').on('submit', function(e) {
        e.preventDefault();
        $.ajax({
            data: $('#updateProposal').serialize(),
            method: 'POST',
            url: $('#updateProposal').attr('action'),
            success: function(data) {
                toastr["success"]("Successfully Updated..");
            }
        });
    })

    $('#editItem').on('submit', function(e){
        e.preventDefault();
        $.ajax({
            data: $('#editItem').serialize(),
            method: 'POST',
            url: $('#editItem').attr('action'),
            success: function(data){
                toastr["success"]("Successfully Updated");
                 location.reload()
            }
        });
    });

    $('#createItem').on('submit', function(e){
        e.preventDefault();
        $.ajax({
            data: $('#createItem').serialize(),
            method: 'POST',
            url: $('#createItem').attr('action'),
            success: function(data) {
                console.log("data: " );
                console.log(data);
                console.log(data.item.id);
                $('#itemsList ol').append('<li><a href="item/'+ $('#ItemProposalCode').val() 
                    + '/' + data.item.id+'">'+ $('#ItemName').val() + '</a></li>');
                //a(href='item/#{item.ProposalCode}/#{item.ItemName}') #{item.ItemName}
                toastr["success"]("Item created Successfully.." );
                //+ JSON.stringify(data));
                $('ul.setup-panel li a[href="#step-4"]').trigger('click');
                $('#createItem')[0].reset();
                console.log("reset");
            }
        });
    });

    // $('#activate-step-2').on('click', function(e) {
    //     $('ul.setup-panel li:eq(1)').removeClass('disabled');
    //     $('ul.setup-panel li a[href="#step-2"]').trigger('click');
    //     //$(this).remove();
    // })

    // $('#activate-step-3').on('click', function(e) {
    //     $('ul.setup-panel li:eq(2)').removeClass('disabled');
    //     $('ul.setup-panel li a[href="#step-3"]').trigger('click');
    //     //$(this).remove();
    // })

    // $('#activate-step-4').on('click', function(e) {
    //     $('ul.setup-panel li:eq(3)').removeClass('disabled');
    //     $('ul.setup-panel li a[href="#step-4"]').trigger('click');
    //     //$(this).remove();
    // })

    // $('#activate-step-5').on('click', function(e) {
    //     $('ul.setup-panel li:eq(4)').removeClass('disabled');
    //     $('ul.setup-panel li a[href="#step-5"]').trigger('click');
    //     //$(this).remove();
    // })
});
