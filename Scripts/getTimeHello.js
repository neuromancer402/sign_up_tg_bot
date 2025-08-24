export function getTimeHello(){
    const hoursNow = new Date().getHours()
    if(hoursNow >= 4 && hoursNow < 12){
        return "Доброе утро ";
    }else if(hoursNow>= 12 && hoursNow < 18){
        return "Добрый день ";
    }else if(hoursNow>=18 && hoursNow<24){
        return "Добрый вечер ";
    }else if(hoursNow>= 0 && hoursNow<4){
        return "Доброй ночи ";
    }else{
        return "Здравствуйте ";
    }
}
