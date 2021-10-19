import styled from 'styled-components'
import Head from 'next/head'
import React, { FunctionComponent, useEffect, useState } from 'react'
import axios from 'axios'
import { configuration } from '../configuration'
import AquaClient from '../graphql/aquaClient'
import { Streamer, StreamerBonus } from '../models/streamer'
import Wrapper from '../components/Layouts/Wrapper'
import lowerCase from 'lodash/lowerCase'
import BonusStripe from '../components/BonusStripe/BonusStripe'
import VideoDiscalimer from '../components/VideoDisclaimer/VideoDisclaimer'
import FullPageLoader from '../components/FullPageLoader'
import Container from '../components/Layouts/Container'
import Player from '../components/Player/Player'

const index: FunctionComponent<any> = ({
    streamerData,
    video,
    mainBonus,
    auxiliaryBonuses,
    relatedVideos,
    relatedSlots,
    countryCode,
}) => {
    const [loading, setLoading] = useState(true)
    const [country, setCountry] = useState<string>('')
    useEffect(() => {
        if (country !== '') getBonusList()
    }, [country])
    const [bonuses, setBonuses] = useState<StreamerBonus[] | undefined>(undefined)
    useEffect(() => {
        console.log(bonuses)
    }, [bonuses])

    console.log(streamerData)

    useEffect(() => {
        geoLocate()
    }, [])

    const geoLocate = async () => {
        const userCountryRequest = await axios.get(configuration.geoApi)
        const countryCode = lowerCase(userCountryRequest.data.country_code2)
        if (countryCode) setCountry(countryCode)
    }

    const getBonusList = async () => {
        const bonusToGet = ['WinCasino', 'StarCasinò Casino', '888 Casino', 'LeoVegas Casino', 'NetBet']

        let bonusForCountry = streamerData.countryBonusList.filter((it) => it.label === country)
        if (bonusForCountry.length == 0)
            bonusForCountry = streamerData.countryBonusList.filter((it) => it.label === 'row')

        const requests = bonusForCountry[0].bonuses.map((b) => axios.get(`${configuration.api}/bonuses/${b.id}`))

        const bList = await Promise.all(requests)

        const remapped = bList.map((r: any) => r.data as StreamerBonus).filter((it) => bonusToGet.includes(it.name))

        const placeholder: StreamerBonus[] = []

        bonusToGet.forEach((name) => {
            const match = remapped!.find((it) => it.name === name)
            if (match) placeholder.push(match)
        })

        console.log(bList.map((r: any) => r.data as StreamerBonus[]))

        setBonuses(remapped)
        setLoading(false)
    }

    const openWebsite = () => window.open('https://www.spikeslot.com')

    const handlePlayerReady = () => {}

    if (loading) return <FullPageLoader />
    return (
        <Wrapper>
            <Container>
                <div className='top-bar' style={{ cursor: 'pointer' }} onClick={() => openWebsite()}>
                    <img className='logo' src='/icons/app_icon.png' />
                </div>

                <Player
                    _bonuses={bonuses}
                    mainBonus={mainBonus}
                    bonusId={video.mainBonus}
                    highLights={video.highLights}
                    onPlayerReady={handlePlayerReady}
                    videoLink={`https://spikeconvertedcomplete.b-cdn.net/${video.videoId}/Default/HLS/${video.videoId}.m3u8`}
                    autoplay={true}
                />

                <h1
                    style={{ color: 'white', background: '#db0d30', fontSize: '1rem', cursor: 'pointer' }}
                    onClick={() => window.open('https://spikeslot.com?from=bakeca')}
                >
                    Clicca QUI per altri video come questo e per ricevere informazioni sulle migliori offerte
                    disponibili
                </h1>

                <h1 style={{ marginTop: '1rem' }}>Migliori casinò legali dove trovare questi giochi:</h1>

                {bonuses &&
                    bonuses.length > 2 &&
                    bonuses.map((bonus: StreamerBonus) => (
                        <BonusStripe key={`${bonus.name}`} bonus={bonus} countryCode={country} />
                    ))}

                {bonuses &&
                    bonuses.length <= 2 &&
                    streamerData.bonuses.map((bonus: StreamerBonus) => (
                        <BonusStripe key={`${bonus.name}`} bonus={bonus} countryCode={country} />
                    ))}

                <div style={{ padding: '1rem' }}>
                    <VideoDiscalimer />
                </div>
                {/* <div className='bottom'>
                    <p style={{textAlign : 'center'}}>This service is provided by <a href='https://www.topaffiliation.com'>Top Affiliation</a></p>
                </div> */}
            </Container>
        </Wrapper>
    )
}

export async function getServerSideProps({ query }) {
    const pickedBonus = query.options

    const aquaClient = new AquaClient()

    const aquaClientSpike = new AquaClient('https://spikeapistaging.tech/graphql')

    const firebaseDatabaseUrl = 'https://spike-2481d.firebaseio.com'

    const slug = 'slot_online_torna_la_dead_or_alive_2_con_acquisti_di_bonus_pazzi_partita_di_novembre'

    const streamer = await axios.get(`${configuration.api}/streamers/${configuration.streamerId}`)
    let videoId

    const remappedVideoId = await axios.get(`${firebaseDatabaseUrl}/AwsVideoMappings/${slug}.json`)
    videoId = remappedVideoId

    const videoData = await (await axios.get(`${firebaseDatabaseUrl}/AwsVideosApproved/${videoId.data}.json`)).data

    const mainBonusId = videoData.mainBonus
    const auxiliaryBonusesId = videoData.auxiliaryBonuses

    const mainBonusRequest = aquaClientSpike.query({
        query: `
        query GET_BONUS_BY_LEGACY_ID($legacyId:String){
            bonuses(where:{ legacyId: $legacyId, country: {code:"it"}}){
            id
            name
            country{
              code
            }
            bonus_guide{
              slug
            }
            rating
            withDeposit
            noDeposit
            backgroundColor
            borderColor
            link
            description
            legacyId
            circular_image{
                url
                alternativeText
            }
            }   
        }
    `,
        variables: {
            legacyId: mainBonusId,
        },
    })

    const auxiliaryRequests = auxiliaryBonusesId.map((b) =>
        aquaClientSpike.query({
            query: `
            query GET_BONUS_BY_LEGACY_ID($legacyId:String){
                bonuses(where:{ legacyId: $legacyId, country: {code:"it"}}){
                id
                name
                country{
                  code
                }
                bonus_guide{
                  slug
                }
                rating
                withDeposit
                noDeposit
                backgroundColor
                borderColor
                link
                description
                legacyId
                circular_image{
                    url
                    alternativeText
                }
                }   
            }
        `,
            variables: {
                legacyId: b,
            },
        })
    )

    const relatedVideosRequest = videoData.relatedVideos.map((videoId) =>
        axios.get(`${firebaseDatabaseUrl}/AwsVideosApproved/${videoId}.json`)
    )

    const bonusResponses = await Promise.all([...auxiliaryRequests, mainBonusRequest])
    const relatedVideos = await Promise.all([...relatedVideosRequest])

    const mainBonus = bonusResponses.find((r) => r.data.data.bonuses[0].legacyId === mainBonusId)?.data.data.bonuses[0]
    const auxiliaryBonuses = bonusResponses
        .filter((r) => r.data.data.bonuses[0].legacyId !== mainBonusId)
        .map((r) => r.data.data.bonuses[0])

    return {
        props: {
            streamerData: streamer.data as Streamer,
            video: videoData,
            mainBonus: mainBonus,
            auxiliaryBonuses: auxiliaryBonuses,
            relatedVideos: relatedVideos.filter((o) => o.data !== undefined).map((res) => res.data),
        },
    }
}

export default index
