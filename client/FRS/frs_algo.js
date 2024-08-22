//program to calculate FRS outcome and strategies

//1: out come 

function calculateAmount(time, time_set, avg_amount_by_day, min_amount, number_of_iteration, participation_token, competitor_generates) {  //834
    //params explained:
    //time: amount of time between withdraws
    //time_set: days, weeks, months
    //avg_amount_by_day: average amount put in the FRS by day
    //min_amount: min amount for transac to be full
    //number_of_iteration: the number of payment
    //participation_token: based on how much their participation generated, an amount of token is redistribuded to augment their generating (regive half to seller)
    

    //constants
    const avg_transac_fee = 0.0169
    const partner_fee = 0.006
    const avg_lend_rate = 0.07 //pull from aave
    const cpl_flat_fee = 0.01 + avg_transac_fee // the fee that we are always keeping

    const competitor_fee = 0.0265

    if (time_set==="days") {
        let total_earnings = 0
        let money_awaiting = 0
        let lending_record = [] // [{"amount": 00, "time": 00}]
        if (participation_token) {
            lending_record.push({"amount": parseFloat(participation_token), "time": parseInt(time)})
        }
        for (let i=0; i<time; i++) { //loop over all days 
            money_awaiting += (avg_amount_by_day - (avg_amount_by_day*avg_transac_fee))
            if (money_awaiting >= min_amount) { //enough to activate FRS
                let percentage_of_year_lended = parseInt(time-i)/365
                let estimated_earnings = (parseFloat(money_awaiting - (money_awaiting*partner_fee)) + (parseFloat(money_awaiting - (money_awaiting*partner_fee)) * avg_lend_rate * percentage_of_year_lended))
                estimated_earnings = estimated_earnings - (estimated_earnings*partner_fee) // remove fees
                //flat_earning = parseFloat(money_awaiting - (money_awaiting*avg_transac_fee))
                if (estimated_earnings > money_awaiting) {
                    lending_record.push({"amount": parseFloat(money_awaiting - (money_awaiting*partner_fee)), "time": parseInt(time-i)})
                    money_awaiting = 0
                }
                
                
            }
        }
        //calculate overall worth at the end of the month 
        for (let i=0; i<lending_record.length; i++) {
            let percentage_of_year_lended = lending_record[i].time/365
            let earnings = (lending_record[i].amount + (lending_record[i].amount * avg_lend_rate * percentage_of_year_lended))
            earnings = earnings - (earnings*partner_fee) // remove fees
            total_earnings += earnings

        }
        total_earnings += money_awaiting
        console.log(total_earnings)
        console.log("Total volume: " + (avg_amount_by_day*time))

        let cpl_outcome = (avg_amount_by_day*time) - (avg_amount_by_day*time*cpl_flat_fee)
       

        let money_left_over = (total_earnings-(avg_amount_by_day*time))
        console.log(money_left_over)
        total_earnings = total_earnings-money_left_over
        total_earnings = total_earnings-cpl_outcome

        //let percentage_of_year_lended = parseInt(time)/365
        //let estimated_earnings = (parseFloat(money_left_over) + (parseFloat(money_left_over * avg_lend_rate * percentage_of_year_lended)))
        //console.log((avg_lend_rate * percentage_of_year_lended-0.002))

        cpl_outcome = cpl_outcome + (money_left_over/2)//amount that grows slower than the reinvested left overs until zero
        console.log("merchant get paid: " + cpl_outcome.toString())

        
        
        /*let half_genrated =(total_earnings-cpl_outcome) * 0.7
        console.log(half_genrated)
        cpl_outcome = cpl_outcome
        let feepaid_cpl = (((avg_amount_by_day*time) - cpl_outcome) /(avg_amount_by_day*time)) * 100

        let outcome_competitor = (avg_amount_by_day*time) - (avg_amount_by_day*time*competitor_fee)
       // console.log("Iteration number: " + number_of_iteration)
        
        //console.log("Total earnings (competitor): " + outcome_competitor.toString())
        //console.log("total earnings (FRS): " + total_earnings.toString())
        console.log("merchant get paid: " + cpl_outcome.toString())
        //console.log("Competitor generates: " + competitor_generates)
        //console.log("FRS generates: " + (total_earnings -outcome_competitor))
        //console.log("Fee paid with cpl: " + feepaid_cpl)

        competitor_generates +=  (avg_amount_by_day*time*competitor_fee)*/

        if (number_of_iteration) {
            calculateAmount(time, time_set, avg_amount_by_day, min_amount, number_of_iteration-1, parseFloat(total_earnings+(money_left_over/2)), competitor_generates)
        }


    } else if (time_set ==="weeks") {

    } else if (time_set === "years") {

    }
    
}

calculateAmount(30, "days", 350, 834, 12, 0, 0)