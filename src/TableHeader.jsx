import React from 'react';


function makeHeading(heading, index) {
    
    var head = <th key={index}>{heading}</th>;
    return head;
}

function TableHeader(props) {
   
    return ( <thead>
            <tr> 
              { props.headings.map( (t, i) => makeHeading(t,i) ) }
            </tr>
             </thead>
           );
}


export {TableHeader};