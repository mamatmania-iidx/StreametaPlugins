var GET_PARTICIPANTS_ID = `
query ($eventSlug: String, $page: Int){
    event(slug: $eventSlug){
        entrants(query:{
            page:$page
            perPage:48}){
                pageInfo {
                    total
                    totalPages
                }
                nodes{
                    id
                    participants{
                        id
                        gamerTag
                    }
                }
            }
        }
    }`;

var GET_PARTICIPANT_SETS = `query ParticipantSet($eventSlug: String, $playerId: ID){
event(slug: $eventSlug){
    sets(filters:
        {
            entrantIds:[$playerId]
            hideEmpty:true
        }){
            nodes{
                phaseGroup {
                    displayIdentifier
                    phase{
                        name
                    }
                }
                fullRoundText
                displayScore
                completedAt
                
            }
        }
    }
}`

var GET_EVENT_SETS = `query EventSets($eventSlug: String, $page: Int){
    event(slug: $eventSlug){
        sets(filters:
            {
                hideEmpty:true
            },
            perPage:96,
            page:$page){
                pageInfo {
                    total
                    totalPages
                }
                nodes{
                    phaseGroup {
                        displayIdentifier
                        phase{
                            name
                        }
                    }
                    fullRoundText
                    displayScore
                    completedAt
                    
                }
            }
        }
    }`;
    
function getEventSetsPageInfo(data){
    return data["data"]["event"]["sets"]["pageInfo"]
}