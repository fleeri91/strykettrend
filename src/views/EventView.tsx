'use client'

import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import sv from 'dayjs/locale/sv'

import { RiHistoryLine } from '@remixicon/react'

import { EventItem, EventList } from '@components/EventList'
import Container from '@components/Container'
import Modal from '@components/Modal'
import { Flex, Icon, LineChart } from '@tremor/react'

import { useGetStryktipsetQuery } from '@store/api/stryktipset'
import { useGetEventsQuery } from '@store/api/events'

import EventInfo from '@components/EventInfo'
import { HistoryList } from '@components/HistoryList'
import { Event } from 'types/Events'
import { formatChartData } from '@utils/format'
import NoEvents from '@components/NoEvents'

const EventView = () => {
  const [isGraphOpen, setIsGraphOpen] = useState<boolean>(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  const { data: stryktipsetData } = useGetStryktipsetQuery(undefined, {
    pollingInterval: 1000 * 60 * 2, // 2 minutes interval
  })

  const { data: eventsData } = useGetEventsQuery(void { pollingInterval: 1000 * 60 * 10 })

  const handleRowClick = async (event?: Event) => {
    event && setSelectedEvent(event)
  }

  useEffect(() => {
    if (stryktipsetData) {
      const date = dayjs().locale(sv).format('HH:mm')
      setLastUpdated(date)
    }
  }, [stryktipsetData])

  return (
    <Container className="my-8">
      {stryktipsetData?.draws.length !== 0 ? (
        <>
          {stryktipsetData && (
            <>
              <EventInfo
                gameType={stryktipsetData.draws[0].productName}
                startTime={stryktipsetData.draws[0].closeTime}
              />
              <Flex className="mb-2">
                <span>{`Senast uppdaterad ${lastUpdated}`}</span>
                <Icon
                  icon={RiHistoryLine}
                  variant="solid"
                  color="slate"
                  tooltip="Historik"
                  className="cursor-pointer"
                  onClick={() => setIsHistoryOpen(true)}
                />
              </Flex>
            </>
          )}
          {eventsData && eventsData[0] && eventsData[0].events.length !== 0 && (
            <EventList>
              {stryktipsetData &&
                stryktipsetData.draws[0].events.map((event, index) => (
                  <EventItem
                    key={index}
                    startTime={dayjs(event.sportEventStart).format('HH:mm')}
                    event={eventsData[0].events[index]}
                    teams={{
                      home: event.participants[0].name,
                      away: event.participants[1].name,
                    }}
                    distribution={event.distribution}
                    odds={event.odds}
                    onClick={() => handleRowClick(eventsData[0]?.events[index]).then(() => setIsGraphOpen(true))}
                  />
                ))}
            </EventList>
          )}
          {selectedEvent && (
            <Modal
              title={`${selectedEvent.teams.home} - ${selectedEvent.teams.away}`}
              isOpen={isGraphOpen}
              onClose={() => setIsGraphOpen(false)}
            >
              <span className="font-bold">Spelprocent</span>
              <LineChart
                className="h-52 mb-8"
                data={formatChartData(selectedEvent.distribution)}
                index="timestamp"
                categories={['home', 'draw', 'away']}
                colors={['indigo', 'rose', 'emerald']}
                yAxisWidth={60}
              />
              <span className="font-bold">Odds</span>
              <LineChart
                className="h-52"
                data={formatChartData(selectedEvent.odds)}
                index="timestamp"
                categories={['home', 'draw', 'away']}
                colors={['indigo', 'rose', 'emerald']}
                yAxisWidth={60}
              />
            </Modal>
          )}
          <Modal title="Data historik" isOpen={isHistoryOpen} width="sm" onClose={() => setIsHistoryOpen(false)}>
            <HistoryList>
              {/*eventsData &&
            eventsData.map((event: EventsRoot, index: number) => (
              <HistoryItem
                key={index}
                time={event.timestamp}
                onClick={() => setSelectedEvent(event)}
              />
            ))*/}
              <></>
            </HistoryList>
          </Modal>
        </>
      ) : (
        <NoEvents />
      )}
    </Container>
  )
}

export default EventView
