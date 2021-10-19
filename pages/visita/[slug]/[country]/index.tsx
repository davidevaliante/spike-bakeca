import React from 'react'
import Head from 'next/head'
import { FunctionComponent } from 'react'
import AquaClient from '../../../../graphql/aquaClient'
import { configuration } from '../../../../configuration'

interface Props {
    redirect: string
}

export const GET_BONUS_BY_SLUG = `
    query GET_BONUS_BY_SLUG($slug:String){
        bonuses(where:{ slug: $slug, country: {code:"it"}}){
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
        }
        }   
    }
`

const index: FunctionComponent<Props> = ({ redirect }) => {
    console.log('redirecting to unibt')
    return (
        <div>
            <Head>
                <meta httpEquiv='refresh' content={`0.1;url=${redirect}`}></meta>
            </Head>
        </div>
    )
}

// unibet https://dspk.kindredplc.com/redirect.aspx?pid=5615153&bid=27508

const bonusQuery = `
query($compareCode:String="hello", $id : ID=1){
    streamer(id:$id){
      bonuses(where:  {compareCode:$compareCode}){
        name
        compareCode
        links{
          link
          label
        }
      }
    }
  }
`

export async function getServerSideProps({ query, res }) {
    const slug = query.slug as string
    const country = query.country as string

    let redirect

    const aquaClient = new AquaClient()

    console.log(`${slug} ${configuration.streamerName} it`)

    const links = await aquaClient.query({
        query: bonusQuery,
        variables: {
            compareCode: slug,
            id: configuration.streamerId,
            label: `${slug} ${configuration.streamerName} ${country}`,
        },
    })

    let link = links.data.data.streamer.bonuses[0].links.find(
        (b) => b.label === `${slug} ${configuration.streamerName} ${country}`
    )
    if (link == undefined)
        link = links.data.data.streamer.bonuses[0].links.find(
            (b) => b.label === `${slug} ${configuration.streamerName} row`
        )

    if (slug === 'wincsn') link = 'https://www.wincasinopromo.it/?mp=20f65900-3c5c-4ac2-a5ee-17aac6ccf2be'
    if (slug === '888') link = 'https://ic.aff-handler.com/c/43431?sr=1868494'
    if (slug === 'leovgs') link = 'https://ads.leovegas.com/redirect.aspx?pid=3704891&bid=1496'
    if (slug === 'netbt') link = 'https://banners.livepartners.com/view.php?z=139081&source=bakeca'
    if (slug === 'starcsn') link = 'http://record.affiliatelounge.com/_SEA3QA6bJTMP_fzV1idzxmNd7ZgqdRLk/132/'

    return {
        props: {
            redirect: link,
        },
    }
}

export default index
