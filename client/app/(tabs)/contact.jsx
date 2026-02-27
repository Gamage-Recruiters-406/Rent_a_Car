import { 
  ScrollView, 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  Linking, 
  ImageBackground, 
  StatusBar,
  Image,
  Dimensions,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '../../components/themed-text';
import { Ionicons } from '@expo/vector-icons';

// Responsive scaling helpers
const { width: BASE_WIDTH, height: BASE_HEIGHT } = Dimensions.get('window');
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const scale = (size) => (BASE_WIDTH / guidelineBaseWidth) * size;
const verticalScale = (size) => (BASE_HEIGHT / guidelineBaseHeight) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

export default function ContactScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  // Responsive breakpoints
  const isSmall = width < 360;
  const isLarge = width > 400;
  const isTablet = width > 600;

  const contactCards = [
    {
      title: 'Address',
      iconName: 'location',
      lines: ['Colombo,', 'Sri Lanka'],
      type: 'address',
    },
    {
      title: 'Mail Us',
      iconName: 'mail',
      lines: ['dev.gamagerecruiters@gmail.com'],
      type: 'email',
    },
    {
      title: 'Telephone',
      iconName: 'call',
      lines: ['0773342567', '0777642250'],
      type: 'phone',
    },
    {
      title: 'Hot Line',
      iconName: 'headset',
      lines: ['0777315095', '0777443552'],
      type: 'phone',
    },
  ];

  const handlePhone = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleLocation = () => {
    Linking.openURL('https://maps.google.com/?q=Colombo,Sri+Lanka');
  };

  const handleLinePress = (line, type) => {
    switch (type) {
      case 'phone':
        handlePhone(line);
        break;
      case 'email':
        handleEmail(line);
        break;
      case 'address':
        handleLocation();
        break;
    }
  };

  // Dynamic responsive styles
  const responsiveStyles = {
    topHeader: {
      paddingTop: insets.top > 0 ? insets.top + 4 : Platform.OS === 'ios' ? 50 : 36,
      paddingHorizontal: moderateScale(16),
    },
    logoText: {
      fontSize: moderateScale(isTablet ? 24 : 20),
    },
    heroSection: {
      height: isTablet ? verticalScale(280) : verticalScale(200),
    },
    heroTitle: {
      fontSize: moderateScale(isTablet ? 36 : 28),
    },
    breadcrumb: {
      fontSize: moderateScale(isTablet ? 18 : 14),
    },
    sectionTitle: {
      fontSize: moderateScale(isTablet ? 28 : 22),
    },
    cardGap: isSmall ? 6 : isTablet ? 16 : 8,
    iconSize: isSmall ? 36 : isTablet ? 60 : 44,
    iconBorderRadius: isSmall ? 8 : isTablet ? 14 : 10,
    iconSymbolSize: isSmall ? 18 : isTablet ? 30 : 24,
    cardTitleSize: isSmall ? 10 : isTablet ? 16 : 12,
    cardTextSize: isSmall ? 8 : isTablet ? 12 : 9,
    cardLineHeight: isSmall ? 12 : isTablet ? 18 : 14,
    cardPaddingV: isSmall ? 12 : isTablet ? 24 : 16,
    cardPaddingH: isSmall ? 4 : isTablet ? 16 : 8,
    infoTextSize: isSmall ? 8 : isTablet ? 13 : 10,
    infoIconSize: isSmall ? 10 : isTablet ? 16 : 12,
    rentBtnFontSize: isSmall ? 7 : isTablet ? 12 : 8,
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Top Header */}
      <View style={[styles.topHeader, responsiveStyles.topHeader]}>
        <View style={styles.logoContainer}>
          <Image 
            source={{ uri: 'https://via.placeholder.com/40x30?text=🚗' }}
            style={[styles.logoIcon, { width: moderateScale(40), height: moderateScale(30) }]}
            resizeMode="contain"
          />
          <ThemedText style={[styles.logoText, { fontSize: responsiveStyles.logoText.fontSize }]}>
            Rent My Car
          </ThemedText>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <View style={[styles.menuIcon, { width: moderateScale(24), height: moderateScale(18) }]}>
            <View style={[styles.menuLine, { width: moderateScale(24), height: moderateScale(3) }]} />
            <View style={[styles.menuLine, { width: moderateScale(24), height: moderateScale(3) }]} />
            <View style={[styles.menuLine, { width: moderateScale(24), height: moderateScale(3) }]} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Blue Info Bar */}
      <LinearGradient
        colors={['#0D3778', '#0D3778', '#999FA8']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        locations={[0.14, 0.46, 1]}
        style={[styles.infoBar, { paddingHorizontal: moderateScale(10), paddingVertical: moderateScale(8) }]}
      >
        <TouchableOpacity style={styles.infoItem} onPress={handleLocation}>
          <Ionicons name="location" size={responsiveStyles.infoIconSize} color="#fff" />
          <ThemedText style={[styles.infoText, { fontSize: responsiveStyles.infoTextSize }]}>
            Find A Location
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.infoItem} onPress={() => handlePhone('0777764224')}>
          <Ionicons name="call" size={responsiveStyles.infoIconSize} color="#fff" />
          <ThemedText style={[styles.infoText, { fontSize: responsiveStyles.infoTextSize }]}>
            0777764224
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.infoItem} onPress={() => handleEmail('rentmycar@gmail.com')}>
          <Ionicons name="mail" size={responsiveStyles.infoIconSize} color="#fff" />
          <ThemedText style={[styles.infoText, { fontSize: responsiveStyles.infoTextSize }]}>
            rentmycar@gmail.com
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.rentButton}>
          <ThemedText style={[styles.rentButtonText, { fontSize: responsiveStyles.rentBtnFontSize }]}>
            Rent Your Car
          </ThemedText>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.scrollContainer} bounces={false}>
        {/* Hero Section */}
        <ImageBackground
          source={{ 
            uri: 'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=800&q=80' 
          }}
          style={[styles.heroSection, responsiveStyles.heroSection]}
          resizeMode="cover"
        >
          <View style={styles.heroOverlay}>
            <View style={styles.heroContent}>
              <ThemedText style={[styles.heroTitle, { fontSize: responsiveStyles.heroTitle.fontSize }]}>
                Contact Us
              </ThemedText>
              <ThemedText style={[styles.breadcrumbText, { fontSize: responsiveStyles.breadcrumb.fontSize }]}>
                Home / Page / Contact
              </ThemedText>
            </View>
          </View>
        </ImageBackground>

        {/* Contact Section */}
        <View style={[styles.contactSection, { paddingHorizontal: moderateScale(16) }]}>
          <ThemedText style={[styles.sectionTitle, { fontSize: responsiveStyles.sectionTitle.fontSize }]}>
            Contact Us
          </ThemedText>

          {/* Contact Cards - 2x2 Grid Layout */}
          <View style={styles.cardsGrid}>
            {/* First Row */}
            <View style={styles.cardsRow}>
              {contactCards.slice(0, 2).map((card) => (
                <TouchableOpacity
                  key={card.title}
                  style={[styles.card, { 
                    paddingVertical: moderateScale(14), 
                    paddingHorizontal: moderateScale(10),
                    borderRadius: moderateScale(12),
                    width: (width - moderateScale(56)) / 2,
                  }]}
                  onPress={() => handleLinePress(card.lines[0], card.type)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconContainer, { 
                    width: moderateScale(40), 
                    height: moderateScale(40),
                    borderRadius: moderateScale(10),
                  }]}>
                    <Ionicons name={card.iconName} size={moderateScale(20)} color="#fff" />
                  </View>
                  
                  <ThemedText style={[styles.cardTitle, { fontSize: moderateScale(12) }]}>
                    {card.title}
                  </ThemedText>
                  
                  <View style={styles.cardLinesContainer}>
                    {card.lines.map((line, idx) => (
                      <TouchableOpacity 
                        key={idx} 
                        onPress={() => handleLinePress(line, card.type)}
                      >
                        <ThemedText style={[styles.cardText, { 
                          fontSize: moderateScale(9),
                          lineHeight: moderateScale(13),
                        }]}>
                          {line}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Second Row */}
            <View style={styles.cardsRow}>
              {contactCards.slice(2, 4).map((card) => (
                <TouchableOpacity
                  key={card.title}
                  style={[styles.card, { 
                    paddingVertical: moderateScale(14), 
                    paddingHorizontal: moderateScale(10),
                    borderRadius: moderateScale(12),
                    width: (width - moderateScale(56)) / 2,
                  }]}
                  onPress={() => handleLinePress(card.lines[0], card.type)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconContainer, { 
                    width: moderateScale(40), 
                    height: moderateScale(40),
                    borderRadius: moderateScale(10),
                  }]}>
                    <Ionicons name={card.iconName} size={moderateScale(20)} color="#fff" />
                  </View>
                  
                  <ThemedText style={[styles.cardTitle, { fontSize: moderateScale(12) }]}>
                    {card.title}
                  </ThemedText>
                  
                  <View style={styles.cardLinesContainer}>
                    {card.lines.map((line, idx) => (
                      <TouchableOpacity 
                        key={idx} 
                        onPress={() => handleLinePress(line, card.type)}
                      >
                        <ThemedText style={[styles.cardText, { 
                          fontSize: moderateScale(9),
                          lineHeight: moderateScale(13),
                        }]}>
                          {line}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 40,
    height: 30,
  },
  logoText: {
    fontWeight: '600',
    color: '#0B3B8C',
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    justifyContent: 'space-between',
  },
  menuLine: {
    backgroundColor: '#0B3B8C',
    borderRadius: 2,
  },
  infoBar: {
    backgroundColor: '#0B3B8C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  infoText: {
    color: '#fff',
  },
  rentButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#999FA8',
  },
  rentButtonText: {
    color: '#0D3778',
    fontWeight: '600',
    fontSize: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  heroSection: {
    width: '100%',
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  breadcrumbText: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  contactSection: {
    paddingVertical: 30,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontWeight: '700',
    color: '#0D3778',
    textAlign: 'center',
    marginBottom: 24,
  },
  cardsGrid: {
    paddingHorizontal: 8,
    gap: 16,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  card: {
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    backgroundColor: '#0D3778',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  cardLinesContainer: {
    alignItems: 'center',
  },
  cardText: {
    color: '#64748b',
    textAlign: 'center',
  },
});
