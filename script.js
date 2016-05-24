function DoIt(){
    var dateRangeFrom = new Date($("#fromDate").val());
    var dateRangeTo= new Date($("#toDate").val());
    var tripLengthDays = $("#days").val();

    var cityFrom = $("#from").val();
    var cityTo = $("#to").val();

    var cheapestFlightsTo = [];
    var cheapestFlightsFrom = [];
    var cheapestFlightsBothSides = [];

    var dateRangeFrom1 = new Date(dateRangeFrom);

    var tripStart = new Date(dateRangeFrom);
    var tripEnd = new Date(dateRangeFrom); tripEnd.setDate(tripStart.getDate() + parseInt(tripLengthDays));

    $("#header").text(cityFrom + " -> " + cityTo);
    $("form").remove();
    $("table").show();
    $('#aa')[0].style.width = "auto";
    $('#aa')[0].style.padding = "0px";

    window.setInterval(function(){
		var asyncReturns = 0;
        
		if(dateRangeFrom1 == dateRangeTo){
			dateRangeFrom1 = new Date(dateRangeFrom);
		}
		var firstPromise = new Promise(function(resolve, reject){
            $.ajax({
            data: '&out=' + dateFormat(dateRangeFrom1, "yyyy-mm-dd") + '&ret=&iata0=' + cityFrom + '&iata1=' + cityTo + '&journey=oneway&provider=waavo&travelport=true',
            url: 'https://avia.lt/includes/sr/table_find_price.php',
            method: 'POST',
            success: function(resp) {
                var resp = {
                    price:resp, 
                    date:dateFormat(dateRangeFrom1, "yyyy-mm-dd")
                };
                
                if (cheapestFlightsTo.indexOf(resp) === -1 && resp.price > 0) { 
                    cheapestFlightsTo.push(resp)
                };
                resolve(resp);
            }});
        });
        
        var secondPromise = new Promise(function(resolve, reject){
            $.ajax({
            data: '&out=' + dateFormat(dateRangeFrom1, "yyyy-mm-dd") + '&ret=&iata0=' + cityTo + '&iata1=' + cityFrom + '&journey=oneway&provider=waavo&travelport=true',
            url: 'https://avia.lt/includes/sr/table_find_price.php',
            method: 'POST',
            success: function(resp) {
                var resp = {
                    price:resp, 
                    date:dateFormat(dateRangeFrom1, "yyyy-mm-dd")
                };
                
                if (cheapestFlightsFrom.indexOf(resp) === -1 && resp.price > 0) { 
                    cheapestFlightsFrom.push(resp)
                };
                resolve(resp);
            }});
        });
        
        var thirdPromise = new Promise(function(resolve, reject){
            $.ajax({
            data: '&out=' + dateFormat(tripStart, "yyyy-mm-dd") + '&ret=' + dateFormat(tripEnd, "yyyy-mm-dd") + '&iata0=VNO&iata1=AMS&journey=roundTrip&provider=waavo&travelport=true',
            url: 'https://avia.lt/includes/sr/table_find_price.php',
            method: 'POST',
            success: function(resp) {
                        var resp = {
                    price:resp, 
                    date:dateFormat(tripStart, "yyyy-mm-dd") + " -> " + dateFormat(tripEnd, "yyyy-mm-dd")
                };
                if (cheapestFlightsBothSides.indexOf(resp) === -1 && resp.price > 0) { 
                    cheapestFlightsBothSides.push(resp)
                };
                resolve(resp);
            }})
        });
        
        Promise.all([firstPromise, secondPromise, thirdPromise]).then(function(results) {
            tripStart.setDate(tripStart.getDate() + 1);
            tripEnd.setDate(tripEnd.getDate() + 1);
            dateRangeFrom1.setDate(dateRangeFrom1.getDate() + 1);

            cheapestFlightsTo = cheapestFlightsTo.sort(function(a, b){if (a.price === 0 || b.price === 0){return 1}return a.price-b.price});
            cheapestFlightsFrom = cheapestFlightsFrom.sort(function(a, b){if (a.price === 0 || b.price === 0){return 1}return a.price-b.price});
            cheapestFlightsBothSides = cheapestFlightsBothSides.sort(function(a, b){if (a.price === 0 || b.price === 0){return 1}return a.price-b.price});

            $("#table1").empty();
            for(var i = 0;i < 20; i++){
                var rows = "<tr>";
                
                rows += cheapestFlightsTo[i] !== undefined ? "<td>" + cheapestFlightsTo[i].date + " " + cheapestFlightsTo[i].price+ "€</td>" : "<td>-</td>";
                rows += cheapestFlightsFrom[i] !== undefined ? "<td>" + cheapestFlightsFrom[i].date + " " + cheapestFlightsFrom[i].price+ "€</td>" : "<td>-</td>";
                rows += cheapestFlightsBothSides[i] !== undefined ? "<td>" + cheapestFlightsBothSides[i].date + " " + cheapestFlightsBothSides[i].price+ "€</td></tr>" : "<td>-</td></tr>";
                
                $("#table1").append(rows);
            }
        }, function() {
            console.log("Fail");        
        });
    }, 10000);

}