import React from 'react'
import Header from '../components/Header'
import BannerSection from '../components/BannerSection'
import SellProperty from '../components/SellProperty'
import RentalProperty from '../components/RentalProperty'
import FeatureBroker from '../components/FeatureBroker'
import Footer from '../components/Footer'
import HomepageBanner from '../components/HomepageBanner'
import WhyChoose from '../components/WhyChoose'

const Home = () => {
  return (
  <>
  <Header/>
  <BannerSection/>
  <SellProperty/>
  <HomepageBanner/>
  <RentalProperty/>
   <WhyChoose/>
  <FeatureBroker/>
 
<Footer/>
  </>
  )
}

export default Home