import { NextResponse } from 'next/server'
import axios from 'axios'
import connectDB from 'src/app/_lib/connectDB'

import EventsSchema from '@schemas/EventsSchema'

import { GAME_TYPE } from 'src/constants'

import { StryktipsetEvent } from 'types/Stryktipset'
import { EventDTO } from 'types/DTO'

export async function GET() {
  try {
    await connectDB()
    const response = await axios.get(
      `https://api.www.svenskaspel.se/external/1/draw/${GAME_TYPE}/draws?accesskey=${process.env.NEXT_PUBLIC_API_KEY}`
    )
    const data = response.data

    if (data) {
      const events: EventDTO[] = data.draws[0].events
        .map((eventData: StryktipsetEvent) => {
          const { participants, distribution, odds, eventNumber } = eventData

          let oddsHome = ''
          let oddsDraw = ''
          let oddsAway = ''

          if (odds) {
            // Check if odds is not null or undefined before accessing its properties
            if (typeof odds.home === 'string') {
              oddsHome = odds.home.replace(',', '.')
              oddsDraw = odds.draw.replace(',', '.')
              oddsAway = odds.away.replace(',', '.')
            }
          }

          const homeParticipant = participants.find((p) => p.type === 'home')
          const awayParticipant = participants.find((p) => p.type === 'away')

          if (homeParticipant && awayParticipant) {
            return {
              eventNumber: eventNumber,
              teams: {
                home: homeParticipant.name,
                away: awayParticipant.name,
              },
              distribution: {
                timestamp: new Date(),
                home: distribution.home,
                draw: distribution.draw,
                away: distribution.away,
              },
              odds: {
                timestamp: new Date(),
                home: oddsHome || (odds ? odds.home : null),
                draw: oddsDraw || (odds ? odds.draw : null),
                away: oddsAway || (odds ? odds.away : null),
              },
            }
          }
        })
        .filter((event: any) => event !== undefined) // Filter out any undefined events

      let existingData = await EventsSchema.findOne()

      if (existingData) {
        events.forEach((newEvent) => {
          const existingEventIndex = existingData.events.findIndex(
            (existingEvent: EventDTO) => existingEvent.eventNumber === newEvent.eventNumber
          )
          if (existingEventIndex !== -1) {
            existingData.events[existingEventIndex].distribution.push(newEvent.distribution)
            existingData.events[existingEventIndex].odds.push(newEvent.odds)
          } else {
            existingData.events.push(newEvent)
          }
        })
        await existingData.save()
      } else {
        const eventData = new EventsSchema({
          events: events.map((event) => ({
            eventNumber: event.eventNumber,
            teams: event.teams,
            distribution: [event.distribution],
            odds: [event.odds],
          })),
        })
        await eventData.save()
      }
    }

    return NextResponse.json({ message: 'Data saved successfully!' })
  } catch (error) {
    return NextResponse.json({ error: error })
  }
}
export const revalidate = 0
