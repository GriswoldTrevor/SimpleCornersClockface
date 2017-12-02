function clockfaceSettings(props) {
  return (
    <Page>
      <Section 
          description={<Text align="center">If settings do not apply automatically, open another app on the watch and return to the clockface.</Text>}
          title={<Text bold>Clockface Settings</Text>}>
        <Toggle
          settingsKey="use24HourTime"
          label="Use 24 hour time"
        />
        <Toggle
          settingsKey="useMetricDistance"
          label="Show distance in metric"
        />
        <Toggle
          settingsKey="useIconColorForCornerText"
          label="Use icon color for corner text"
        />
        <TextInput
          label="Background Color (in 6 digit #hex)"
          settingsKey="backgroundColor"
          placeholder="#000000"
        />
        <TextInput
          label="Text Color (in 6 digit #hex)"
          settingsKey="textColor"
          placeholder="#FFFFFF"
        />
        <TextInput
          label="Icon Color (in 6 digit #hex)"
          settingsKey="iconColor"
          placeholder="#FFFFFF"
        />
      </Section>
    </Page>
  );
}

registerSettingsPage(clockfaceSettings);